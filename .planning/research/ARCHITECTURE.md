# Architecture Patterns

**Domain:** Expo 每日益智 App（离线、确定性今日谜题）  
**Project:** 傻了么 (Silaomo)  
**Researched:** 2026-05-16  
**Confidence:** HIGH（路由/持久化来自官方文档）；MEDIUM（谜题生成模块划分来自领域惯例 + 项目约束推导）

## Executive Recommendation

采用 **四层边界**：`lib/puzzles/`（纯函数域逻辑）→ `lib/storage/`（持久化）→ `hooks/useDailyGame.ts`（编排）→ `app/` + `components/`（UI）。  
每日循环由 **本地日历日 `dateKey` + 可复现种子** 驱动；启动时 **先 hydrate 再 Redirect**，不把 `initialRouteName` 当作业务路由依据（Expo 文档明确其主要用于深链，非常规启动分流）。

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  app/ (expo-router screens)                                      │
│  index → Redirect    game    result    (auth)/login [stub]       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ useDailyGame(), navigation
┌───────────────────────────▼─────────────────────────────────────┐
│  hooks/                                                          │
│  useDailyGame.ts  ── orchestrates hydrate / play / finish        │
│  useSudokuGame.ts / useBinaryGame.ts  [optional, in-game only]   │
└───────────┬─────────────────────────────┬───────────────────────┘
            │                             │
┌───────────▼──────────┐    ┌─────────────▼───────────────────────┐
│  lib/storage/        │    │  lib/puzzles/                        │
│  dailyStorage.ts     │    │  dailySelector, rng, sudoku/, binary/ │
└───────────┬──────────┘    └─────────────────────────────────────┘
            │
┌───────────▼──────────┐
│  AsyncStorage        │  (MVP: @react-native-async-storage/async-storage)
│  [v2: expo-sqlite    │   或 Zustand persist 同一 storage 适配器]
│   kv-store 可选]     │
└──────────────────────┘
```

---

## Folder Structure (Aligned with PROJECT.md)

在用户规划基础上补全 **职责单一** 的子目录，避免 `game.tsx` 膨胀：

```
foolish-you/
├── app/
│   ├── _layout.tsx          # 根布局：字体/主题；可选 DailyProvider
│   ├── index.tsx            # 启动分流：未完成 → /game，已结束 → /result 或首页
│   ├── game.tsx             # 今日对局壳：按 gameType 挂载对应 Grid
│   ├── result.tsx           # 结果页：文案 + reanimated
│   └── (auth)/
│       └── login.tsx        # v1 占位（Redirect 回 index 或静态说明）
│
├── components/
│   ├── Grid/
│   │   ├── SudokuGrid.tsx
│   │   └── BinaryGrid.tsx
│   ├── GameToolbar.tsx      # 完成 / 放弃 / 计时 / 提示
│   └── FunnyFeedback.tsx
│
├── lib/
│   ├── puzzles/
│   │   ├── types.ts           # GameType, PuzzlePayload, PlayGridState
│   │   ├── rng.ts             # 种子 PRNG（mulberry32 / alea，无 Math.random）
│   │   ├── dailySelector.ts   # dateKey → gameType + puzzleSeed + 防连日复用
│   │   ├── registry.ts        # type → generator / validator / default size
│   │   ├── sudoku/
│   │   │   ├── generator.ts
│   │   │   ├── solver.ts
│   │   │   └── validate.ts
│   │   └── binary/
│   │       ├── generator.ts
│   │       ├── rules.ts
│   │       └── validate.ts
│   ├── storage/
│   │   └── dailyStorage.ts    # get/set/clear DailySnapshot
│   └── feedback/
│       └── messages.ts        # 成功/失败文案池 + seeded pick
│
├── hooks/
│   ├── useDailyGame.ts        # 核心：hydrate、今日态、finish/abandon
│   ├── useSudokuGame.ts       # 可选：局内 grid 变更 + 冲突高亮
│   └── useBinaryGame.ts
│
├── stores/                    # 可选；MVP 可省略
│   └── dailyStore.ts          # Zustand + persist(partialize DailySnapshot)
│
└── constants/
    └── config.ts              # 网格规格、难度、存储 key 版本
```

**原则：** `lib/puzzles/**` 不 import React / expo-router / AsyncStorage；便于 Jest 单测与日后抽成共享包。

---

## Component Boundaries

| Layer | Location | Responsibility | Must NOT |
|-------|----------|----------------|----------|
| **Screens** | `app/*.tsx` | 路由、`<Redirect>`、组合组件、调用 hook | 谜题生成算法、存储 key 细节 |
| **Presentation** | `components/**` | 网格 UI、动画、无障碍标签 | 决定「今日游戏类型」、写 AsyncStorage |
| **Orchestration** | `hooks/useDailyGame.ts` | 日期 rollover、加载/保存 snapshot、暴露 `status`/`puzzle`/`actions` | 数独/Binary 规则校验实现 |
| **Domain** | `lib/puzzles/**` | 生成、校验、完成判定、种子随机 | 感知导航、平台 API |
| **Persistence** | `lib/storage/dailyStorage.ts` | 序列化/反序列化、迁移版本号 | 业务规则（何时算新一天） |
| **Auth stub** | `app/(auth)/` | 预留路由与 secure-store 接口 | v1 真实 OAuth 流程 |

### `useDailyGame` 契约（建议）

```typescript
// hooks/useDailyGame.ts — 面向屏幕的单一 API
type DailyStatus = 'loading' | 'ready' | 'playing' | 'completed' | 'abandoned';

interface UseDailyGameResult {
  status: DailyStatus;
  dateKey: string;
  gameType: 'sudoku' | 'binary' | null;
  puzzle: SudokuPuzzle | BinaryPuzzle | null;  // 只读题面 + 预填
  playState: PlayGridState | null;             // 用户进度
  isHydrated: boolean;
  actions: {
    refreshForToday: () => Promise<void>;      // 冷启动 / 跨日
    updatePlayState: (next: PlayGridState) => void;
    persistPlayState: () => Promise<void>;     // 防抖后写盘
    complete: (success: boolean) => Promise<void>;
    abandon: () => Promise<void>;
  };
}
```

局内细粒度状态（选中格、冲突列表）留在 `useSudokuGame` / `useBinaryGame` 或 Grid 内部 `useState`，**完成/放弃** 时由 screen 调用 `useDailyGame.actions.complete|abandon`。

---

## Data Model & Storage

### `DailySnapshot`（持久化单一真相）

```typescript
// lib/puzzles/types.ts
interface DailySnapshot {
  schemaVersion: 1;
  dateKey: string;              // 本地时区 YYYY-MM-DD（DAILY-02/03）
  gameType: 'sudoku' | 'binary';
  puzzleSeed: number;           // 再生同一题面
  status: 'playing' | 'completed' | 'abandoned';
  outcome?: 'success' | 'failure';
  puzzle: SerializedPuzzle;     // 题面（给定数 / 尺寸），体积小
  playState?: SerializedPlay;   // 用户填写进度
  previousGameType?: 'sudoku' | 'binary'; // 支持 DAILY-05 防连续同类型
  startedAt?: number;
  finishedAt?: number;
}
```

| 字段 | 来源 | 说明 |
|------|------|------|
| `dateKey` | `lib/puzzles/dateKey.ts` | `Intl` / 本地 midnight，**禁止** 仅用 UTC `toISOString().slice(0,10)` |
| `gameType` | `dailySelector.ts` | 由 `hash(dateKey)` 决定，可参考昨日类型避免连复 |
| `puzzleSeed` | `dailySelector.ts` | 与 `gameType` 组合生成唯一题面 |
| `puzzle` | `generator.*` | 启动日或跨日时生成一次并写入 |
| `playState` | Grid hooks | 每次变更防抖写入（300–500ms） |

**存储实现（MVP）：** `@react-native-async-storage/async-storage`，key 如 `@silaomo/daily/v1`。  
**可选升级：** `expo-sqlite/kv-store` 作为 drop-in（Expo SDK 文档），或 Zustand `persist` + `createJSONStorage(() => AsyncStorage)`（Zustand 官方 persist 文档）。

---

## Daily Selection & Puzzle Generation Flow

### 1. 日期与种子

```
local now → dateKey("2026-05-16")
         → seedBase = hashString(dateKey)        // cyrb53 / FNV 即可，无需后端
         → gameType = pickType(seedBase, yesterdayType)  // DAILY-01, DAILY-05
         → puzzleSeed = deriveSeed(seedBase, gameType)
```

使用 **确定性 PRNG**（如 mulberry32、`seedrandom`），禁止在题面生成路径使用 `Math.random()`（否则无法从 `puzzleSeed` 复现）。

### 2. 跨日 / 同日分支（`dailySelector` + `useDailyGame`）

```
App Launch
    │
    ▼
load DailySnapshot from storage
    │
    ├─ snapshot missing ──► buildNewDay(dateKey) ──► save ──► status=playing
    │
    ├─ snapshot.dateKey < today ──► buildNewDay(today) ──► save ──► playing
    │
    └─ snapshot.dateKey === today
           ├─ status playing ──► restore puzzle + playState
           ├─ status completed|abandoned ──► DAILY-04：不进新局
           └─ corrupt / schema bump ──► migrate or rebuild (log + 新局)
```

`buildNewDay` 内部：

1. `selectGameType(dateKey, previousGameType)`
2. `registry.get(gameType).generate(puzzleSeed, difficulty)`
3. 返回完整 `DailySnapshot`（`playState` 为空或仅含给定格）

### 3. 扩展第三种谜题（未来）

在 `lib/puzzles/registry.ts` 注册：

```typescript
const puzzleRegistry = {
  sudoku: { generate, validate, isComplete, defaultSize: 9 },
  binary: { generate, validate, isComplete, defaultSize: 8 },
} as const;
```

`dailySelector` 仅扩大 `pickType` 的枚举权重；`app/game.tsx` 用 `switch (gameType)` 或 `registry` 映射 Grid 组件。

---

## Navigation & Screen Data Flow

### 路由（NAV-01 / NAV-02）

| Route | 职责 |
|-------|------|
| `/` (`index.tsx`) | `!isHydrated` → 占位；`playing` → `<Redirect href="/game" />`；`completed\|abandoned` → `/result` 或首页「明天见」 |
| `/game` | 消费 `useDailyGame`；挂载 `SudokuGrid` / `BinaryGrid`；工具栏触发 complete/abandon |
| `/result` | 读 snapshot 的 `outcome` + `messages.pick(seed)`；禁止在无 snapshot 时长期停留 |
| `/(auth)/login` | v1：占位 + `Redirect`（AUTH-02） |

**启动分流：** 在 `index.tsx` 或根 `_layout.tsx` 用 `<Redirect />`（Expo Router 官方模式），依据 `useDailyGame.status`，**不要**依赖 `unstable_settings.initialRouteName` 做业务逻辑（社区与文档均表明其主要用于深链默认栈）。

```tsx
// app/index.tsx — 模式示意
export default function Index() {
  const { status, isHydrated } = useDailyGame();
  if (!isHydrated) return <Splash />;
  if (status === 'playing') return <Redirect href="/game" />;
  if (status === 'completed' || status === 'abandoned') return <Redirect href="/result" />;
  return <TomorrowTeaser />;
}
```

### 一局内的数据流

```
SudokuGrid onChange
    → useSudokuGame local state
    → validate (lib/puzzles/sudoku/validate)
    → useDailyGame.actions.updatePlayState + persistPlayState (debounced)

Toolbar「完成」
    → isComplete(puzzle, playState)  [domain]
    → complete(success) → storage → router.replace('/result')

Toolbar「放弃」
    → abandon() → storage → router.replace('/result')
```

---

## State Management Choice

| 方案 | 何时用 |
|------|--------|
| **Hook + `useDailyGame` + Context（可选）** | MVP 默认：状态面小，符合 PROJECT「Zustand 可选」 |
| **Zustand `persist`** | 多屏同时读 snapshot、或厌倦 prop drilling 时；`partialize` 只持久化 `DailySnapshot` 字段 |

避免两套真相：若引入 Zustand，**`useDailyGame` 应薄封装 store**，而不是 hook 与 store 各写一份 storage。

---

## Suggested Build Order

按 **可测域逻辑优先 → 存储 → 编排 → UI → 抛光** 排序，便于每个阶段可玩验证：

| Phase | Deliverable | Verifies |
|-------|-------------|----------|
| **1** | `lib/puzzles/types`, `rng`, `dateKey`, `dailySelector` + 单元测试 | DAILY-01/02/05 逻辑 |
| **2** | `lib/puzzles/sudoku/*`（generator, validate, isComplete） | SUDO-01–04 |
| **3** | `lib/puzzles/binary/*` | BIN-01–04 |
| **4** | `lib/storage/dailyStorage` + schemaVersion | STOR-01 |
| **5** | `hooks/useDailyGame`（hydrate / rollover / complete / abandon） | DAILY-03/04, STOR-02/03 |
| **6** | `app/_layout`, `index` Redirect 流 | NAV-02 |
| **7** | `SudokuGrid` + `app/game`（仅 Sudoku） | 首条可玩竖切 |
| **8** | `BinaryGrid` + `game` 分支 | 双类型 |
| **9** | `result` + `FunnyFeedback` + reanimated | RSLT-01–03 |
| **10** | `GameToolbar` 计时/提示、`(auth)/login` 占位 | GAME-01/02, AUTH-02 |

**首个竖切里程碑：** 完成 1–7 即可在真机上演示「今日数独 → 完成 → 结果 → 次日新题」。

---

## Patterns to Follow

### Pattern 1: Registry + Pure Domain

**What:** 所有谜题类型实现相同接口（`generate`, `validate`, `isComplete`）。  
**When:** 新增游戏类型或统一测试。  
**Why:** `game.tsx` 保持薄，符合「扩展只需 dailySelector + Grid」约束。

### Pattern 2: Generate Once, Persist Puzzle

**What:** 题面在「新一天」生成后写入 snapshot，局内只改 `playState`。  
**When:** 任意需要断点续玩的每日游戏。  
**Why:** 避免重进 App 题面变化；满足 DAILY-02。

### Pattern 3: Debounced Persistence

**What:** 网格变更防抖写 AsyncStorage。  
**When:** 用户频繁填格。  
**Why:** 减少 I/O；杀进程后仍能恢复（STOR-01）。

### Pattern 4: Seeded Feedback

**What:** `messages.ts` 用 `hash(dateKey + outcome)` 选文案，与题面独立。  
**When:** 结果页搞笑 copy。  
**Why:** 同日结果文案稳定，仍可有随机感。

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Puzzle Logic in Screen Components

**What:** 在 `game.tsx` 内写生成/求解。  
**Why bad:** 无法单测、难以加 Binary、违反离线复现。  
**Instead:** 全部放入 `lib/puzzles/`。

### Anti-Pattern 2: UTC Date for «Today»

**What:** `new Date().toISOString().slice(0, 10)`。  
**Why bad:** 用户本地午夜前后「今日」错位（DAILY-03）。  
**Instead:** 显式 `getLocalDateKey()` 工具函数并单测时区边界。

### Anti-Pattern 3: Math.random() for Daily Content

**What:** 未播种的随机。  
**Why bad:** 同日复现失败；无法从 `puzzleSeed` 重建。  
**Instead:** `rng(seed)` 贯穿 selector 与 generator。

### Anti-Pattern 4: Dual Navigation Logic

**What:** `index` 与 `game` 各自判断「是否已完成」并 `replace`。  
**Why bad:** 竞态、重复跳转、难测。  
**Instead:** **仅** `index`（或根 layout）分流；`game` 假定已进入 playing。

### Anti-Pattern 5: Over-Engineering Global Store Early

**What:** 首日就上 Redux + 多层 middleware。  
**Why bad:** 与 PROJECT「状态简单」冲突。  
**Instead:** `useDailyGame` 直至出现明确痛点再引入 Zustand persist。

---

## Scalability Considerations

本 App 为 **纯本地、无后端**；用户规模不改变架构，只影响商店分发与包体。

| Concern | MVP (1 device) | Growth | Notes |
|---------|----------------|--------|-------|
| 存储体积 | 单 snapshot &lt; 10KB | 可加 7 日历史表（v2 POL-01） | 题面+进度 JSON 即可 |
| 生成耗时 | 主线程 &lt; 100ms 目标 | 超时可放 `InteractionManager` 或 worker | 数独生成最重，需 profile |
| 新游戏类型 | registry 注册 | 同左 | 不改 storage schema 时可只 bump `schemaVersion` |
| 跨设备同步 | 无 | AUTH-11 + 后端 | v2；v1 预留 `(auth)/` 即可 |

---

## Testing Strategy (Architecture-Level)

| Target | Location | Type |
|--------|----------|------|
| `dailySelector` | `lib/puzzles/__tests__` | 固定 `dateKey` 快照 |
| `sudoku`/`binary` generators | 同上 | 属性测试：解唯一、规则满足 |
| `dailyStorage` | `lib/storage/__tests__` | mock AsyncStorage |
| `useDailyGame` | `hooks/__tests__` | `@testing-library/react-native` + mock storage |
| Navigation | Detox / Maestro 可选 | 跨日需 mock 系统时间 |

---

## Auth Extension Point (v1 Stub)

```
app/(auth)/login.tsx     → 仅占位 UI
lib/auth/session.ts      → getToken / setToken via expo-secure-store（空实现）
hooks/useSession.ts      → 始终返回 guest

// v2: useDailyGame 在 hydrate 后若 session 存在 → 拉远程 snapshot 合并
```

不在 MVP 把 `DailySnapshot` 与 Supabase 耦合；保持 **guest 路径完整**。

---

## Sources

| Topic | Source | Confidence |
|-------|--------|------------|
| expo-router Redirect | [Expo Router redirects](https://docs.expo.dev/router/reference/redirects) | HIGH |
| Zustand + AsyncStorage | [Zustand persist + createJSONStorage](https://github.com/pmndrs/zustand/blob/main/docs/reference/integrations/persisting-store-data.md) | HIGH |
| expo-sqlite kv-store | [Expo SQLite kv-store](https://docs.expo.dev/versions/latest/sdk/sqlite) | HIGH |
| 确定性每日种子 | [seedrandom](https://github.com/davidbau/seedrandom), [SO: random per day](https://stackoverflow.com/questions/19043377/random-number-in-javascript-per-day-once) | MEDIUM |
| 项目约束与目录 | `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md` | HIGH |

---

## Open Questions (Phase-Specific Research)

- **Binary 规格：** 默认网格边长（8×8 / 10×10）、是否允许唯一解校验的生成算法复杂度 → 建议在 Binary 实现阶段做 `gsd-phase-researcher` spike。
- **数独难度：** 「每日一题」难度曲线是否随 `dateKey` 变化 → 产品决策，影响 `generator` 参数。
- **跨日边界 QA：** 用户更改系统时区时的行为 → 需 UAT 用例（接受「以本地日历为准」即可）。
