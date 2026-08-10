<!-- generated-by: gsd-doc-writer -->

# Testing — 傻了么 (Brainfool)

This document describes how tests are organized, how to run them locally, how CI enforces quality gates, and when to use manual QA on device.

## Test framework and setup

The project uses **Jest 29** with a **dual-project** configuration defined in `jest.config.js`:

| Project | Preset | Environment | File pattern | Purpose |
|---------|--------|-------------|--------------|---------|
| `unit` | `ts-jest` | `node` | `**/__tests__/**/*.test.ts` | Pure logic: puzzles, storage, date, copy |
| `rtl` | `jest-expo` | React Native (via jest-expo) | `**/__tests__/**/*.test.tsx` | Components, hooks, contexts, screens |

**Dev dependencies:** `jest`, `jest-expo`, `ts-jest`, `@testing-library/react-native`, `react-test-renderer`, `@types/jest`.

**Setup files:**

- `jest.setup.js` — shared by both projects. Mocks AsyncStorage and Reanimated; sets `global.__DEV__ = true` for unit tests.
- `jest.setup.rtl.js` — RTL-only. Mocks `expo-router`, `localDay` (fixed `dateKey`), safe-area context, and `runAfterInteractions`.

Install dependencies before running tests:

```bash
npm ci   # or npm install for local dev
```

The RTL project runs with `maxWorkers: 1` in Jest config to reduce flakiness. The `test:rtl` script also sets `--testTimeout=20000` for slower screen tests.

## Running tests

Run the full suite (both projects):

```bash
npm test
```

Run projects separately:

```bash
npm run test:unit       # jest --selectProjects unit
npm run test:rtl        # jest --selectProjects rtl --testTimeout=20000
npm run test:migration  # migration golden fixtures under __tests__/lib/storage/migration/
```

Run a single file:

```bash
npm test -- __tests__/lib/puzzles/dailySelector.test.ts
npm test -- __tests__/screens/game.test.tsx
```

Filter by test name:

```bash
npm test -- -t "returns stable gameType"
```

**Related checks** (same bar as CI):

```bash
npm run typecheck      # tsc --noEmit
npm run test:migration # storage migration golden fixtures (also in CI)
npm run lint           # expo lint
```

## `__tests__/` layout

```
__tests__/
├── lib/                    # Unit tests (*.test.ts)
│   ├── puzzles/            # Generators, validators, solvers, dailySelectorSafe (incl. slitherlink)
│   ├── storage/            # Snapshot read/write, validation, migration, recover, recoveryLog
│   │   └── migration/      # Golden fixtures (v1→current, v2 snapshots); run via test:migration
│   ├── share/              # buildShareCard
│   ├── stats/              # computeStatsCards, weeklyCompletedCount
│   ├── rating/             # shouldPromptRating, maybePromptAppReview
│   ├── time/               # formatElapsedClock, computeElapsedMs
│   ├── date/               # Local calendar day helpers
│   ├── daily/              # Hydrate/build orchestration
│   ├── streak/             # Streak, freeze, missed-yesterday logic
│   ├── i18n/               # en-smoke, locale helpers
│   └── copy/               # User-facing string helpers
├── integration/            # Cross-module habit-depth flows (v2.1+)
├── contexts/               # DailyGameContext RTL
├── hooks/                  # useSudokuBoard, useBinaryBoard, useSlitherlinkBoard (Nonogram via grid RTL)
├── components/grid/        # SudokuGrid, BinaryGrid, NonogramGrid, SudokuNumpad
├── components/slitherlink/ # SlitherlinkBoard
├── components/game/        # GameScreenHeader, GameScreenFooter
├── screens/                # index, game, result, privacy
└── helpers/                # Shared fixtures and mocks
    ├── dailyGameFixtures.ts
    ├── expoRouterMocks.ts
    ├── renderWithI18n.tsx
    └── screenTestUtils.tsx
```

### Writing new tests

**Unit tests (`.test.ts`):**

- Place under `__tests__/lib/` mirroring the source path (e.g. `lib/puzzles/foo.ts` → `__tests__/lib/puzzles/foo.test.ts`).
- Import from `lib/` with relative paths; no React or RN imports.
- Prefer deterministic inputs (fixed `dateKey`, seeds) for puzzle and daily-selection tests.

**RTL tests (`.test.tsx`):**

- Place under `__tests__/contexts/`, `__tests__/hooks/`, `__tests__/components/`, or `__tests__/screens/` depending on what you are testing.
- Use `@testing-library/react-native` (`render`, `screen`, `fireEvent`, `waitFor`, `act`).
- Wrap screens in `ScreenProviders` from `__tests__/helpers/screenTestUtils.tsx` when `DailyGameContext` or dev UI state is required (`locale` prop defaults to `zh`).
- Use `renderWithI18n` from `__tests__/helpers/renderWithI18n.tsx` for components that only need `I18nTestProvider` (pass `{ locale: 'en' }` for English).
- Use `dailyGameFixtures.ts` for snapshot fixtures and `expoRouterMocks.ts` for navigation assertions.

**What to test where:**

| Layer | Test type | Location |
|-------|-----------|----------|
| Puzzle algorithms, storage, date | Unit | `__tests__/lib/` |
| Context orchestration | RTL | `__tests__/contexts/` |
| Board hooks | RTL | `__tests__/hooks/` |
| Grid components | RTL | `__tests__/components/` |
| Route screens | RTL | `__tests__/screens/` |
| Visual polish, animations, gestures | Manual QA | Device/simulator |

## Coverage requirements

No coverage threshold is configured in `jest.config.js` or CI. Coverage output is not enforced on pull requests.

To generate a local coverage report (optional):

```bash
npm test -- --coverage
```

The `coverage/` directory is gitignored.

## CI integration

Workflow: `.github/workflows/ci.yml` — job **`verify`**

| Trigger | `push` and `pull_request` to `main` or `master` |
|---------|--------------------------------------------------|
| Runner | `ubuntu-latest`, Node.js 22 (from `.nvmrc`), npm 11+ |
| Install | `npm ci` |

Steps (in order):

1. **Typecheck** — `npm run typecheck`
2. **Tests** — `npm test` (runs both `unit` and `rtl` projects; currently 476 tests)
3. **Migration tests** — `npm run test:migration`
4. **Lint** — `npm run lint`

All four must pass before merging. Locally, run the same commands before claiming a change is done.

## Manual QA checklist

Automated tests cover logic and component behavior; they do not replace on-device checks for layout, animations, and persistence across app restarts. Use this checklist after UI or storage changes:

- [ ] **Fresh install / clear storage** — Open app; today's puzzle loads with correct type (**Sudoku**, **Binary**, **Nonogram**, or **Slitherlink 7×7**) for the local day.
- [ ] **Mid-game persistence** — Fill some cells or edges, kill the app, reopen; progress and timer restore.
- [ ] **Complete flow** — Finish today's puzzle; result screen shows copy, three stats cards, share button (if `playState` valid), streak line on win, freeze shield suffix on stats when applicable, and animations.
- [ ] **Share card** — Tap copy/share CTA; clipboard contains emoji grid + timing/streak line (no solution leak for Nonogram/Slitherlink).
- [ ] **Surrender flow** — Abandon from game screen; result screen reflects surrender state (no streak check-in).
- [ ] **Recovery** — Dev「注入坏盘面」→ kill app → reopen; outcome preserved, share hidden if `playState` stripped.
- [ ] **Conflict feedback** — Enter invalid Sudoku/Binary values; conflict highlighting appears. (Nonogram validates on complete only; Slitherlink has no mid-game conflict UI.)
- [ ] **Nonogram complete** — Finish a nonogram day; result shows pattern reveal card with correct title.
- [ ] **Slitherlink complete** — Edge tap cycle (line → × → blank); long-press clears edge; unknown edges allowed at complete gate; result reveal + share without solution leak.
- [ ] **Rules modal** — Open in-game rules; content matches current game type.
- [ ] **Streak** — Win on consecutive days; streak count updates; skip exactly one calendar day with shield → shield consumed, streak preserved on reopen.
- [ ] **Streak freeze UI** — After shield auto-consume on open, game header shows freeze line (**not** missed-yesterday recall).
- [ ] **Missed yesterday** — Gap ≥ 2 days without shield → game header shows recall subline until today is completed.
- [ ] **Dev panel (`__DEV__` only)** — Force game type / **regenerate today** (keep type vs random) / inject recovery / **连签 QA 场景** / clear rating & history / settings locale preview; confirm no dev shortcuts in release builds.
- [ ] **English locale** — Device English or DevTools settings preview; game/result/privacy show **Brainfool** branding; share CTA uses `#Brainfool`.

EAS preview/production builds (`eas.json`) require device verification before tagging release-ready.

### v2.1 habit depth manual QA

Run on **EAS dev client** after `expo-notifications` native rebuild (v21-05). Record build ID when checking off [VERIFICATION.md](../.planning/phases/v2.1-content-depth/VERIFICATION.md).

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 难度 | Dev 改 dateKey Mon vs Sun | 可玩；Mon 更易（givens/clues） |
| 2 | 月历 | 结果页「查看本月」 | Sheet 四态；上月导航；summary 数字 |
| 3 | 月历 | 认怂后 reopen 月历 | ○ 显示（含历史 v2） |
| 4 | 月历 | 护盾消耗日 | 🛡 显示 |
| 5 | 提醒 | 首次通关 soft ask | inline card；abandon 无 |
| 6 | 提醒 | 20:00+ playing | D banner；freeze 日不冲突 |
| 7 | 提醒 | EAS dev build 权限 grant/deny | D-06 行为 |
| 8 | 提醒 | 完成后再到提醒时刻 | 无推送 |
| 9 | 图鉴 | 月历 CTA 生成 | PNG share sheet |
| 10 | i18n | 系统 en | Brainfool + 新 strings |

Start the dev server for manual testing:

```bash
npm start
# or: npx expo start
```

For release confidence, also verify on at least one iOS and one Android device or simulator before shipping store builds (see `eas.json` profiles).

### v2.2 温和成长（Gentle Growth）manual QA

Run on **`__DEV__` build** (Expo dev client or `npx expo run:ios` / `run:android`). Dev panel → **温和成长 QA** 区块注入 history，再点 **一键通关** 进入结果页。设计约束：**永不负反馈**、平常日沉默、无图表/难度标签。

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 结果页·平常 | Dev → **近况·平常** → **一键通关** | 毒舌 + 统计卡之间 **无** 成长行 |
| 2 | 结果页·火热 | Dev → **近况·火热** → **一键通关** | 出现一行正向近况（如「这周几乎天天都来」类 pool） |
| 3 | 结果页·稳定 | Dev → **近况·稳定** → **一键通关** | 出现稳定口吻成长行 |
| 4 | 结果页·召回 | Dev → **近况·召回** → **一键通关** | 出现「好久不见」类召回口吻 |
| 5 | 认怂·召回 | 同上注入召回 → 游戏页 **放弃**（非一键通关） | 仍显示召回成长行（D-10 唯一例外） |
| 6 | 月历·成长 | Dev → **月历·比上月多** → **一键通关** → 结果页 **查看本月** | summary 含「本月通关 N 天」+ **比上月多 M 天**（M>0） |
| 7 | 月历·首月 | 新装 / **重置通关记录** 后仅本月数据 → 打开月历 | **不**出现「比上月多」（lastMonthCount=0 抑制） |
| 8 | i18n | 系统 en 或 Dev 设置预览 en | 成长行与 `completedDeltaLine` 无 CJK；Brainfool 品牌不变 |
| 9 | 存储 | 通关后 DevTools date 行 + migration 测试 | `CompletionEntry` 含 `gameType`（v3）；老数据 migration 不回填 |

截图验收目录与 Maestro 命令见 [docs/qa/v2.2-gentle-growth/README.md](./qa/v2.2-gentle-growth/README.md)。

### v2.3 同类更顺（Same-Type Smoother）manual QA

在 v2.2 手测基础上追加。Dev → **温和成长 QA** → **彩蛋·同类更顺** → **一键通关**。

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 结果页·smoother | Dev → **彩蛋·同类更顺** → **一键通关** | 平常日（非火热/召回）出现 **smoother** 成长行 |
| 2 | 节奏优先 | 先注入 **近况·火热** 再通关（同历史） | 显示火热行，**不**显示 smoother |
| 3 | i18n | en 预览下 smoother 场景 | 成长行无 CJK |

Maestro：`maestro test .maestro/flows/v23/v23-growth-smoother.yaml` — 见 [docs/qa/v2.3-same-type-smoother/README.md](./qa/v2.3-same-type-smoother/README.md)。

### v2.4 周日特辑 + 数绘扩充（Sunday Special + Nonogram）manual QA

验收矩阵：[v2.4-VERIFICATION.md](../.planning/phases/v2.4-sunday-special/v2.4-VERIFICATION.md)。完整步骤与可选证据目录：[docs/qa/v2.4-sunday-special/README.md](./qa/v2.4-sunday-special/README.md)。

**前置（推荐）：** `__DEV__` 面板点 **假日期·周日**（固定 `2026-07-12`）。或：Simulator → Settings → Date & Time → 关自动 → 设周日 → 杀 App 重开。

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 游戏页·特辑 | 周日、无护盾/召回 | 副行短身份「周日特辑」/ “Sunday Special.”；题型标题无后缀 |
| 2 | D-05·护盾 | 周日 + Dev **护盾已垫**（`freeze-consumed-ui`） | **仅**护盾副行；不与特辑叠行 |
| 3 | D-05·召回 | 周日 + Dev **漏签召回**（`gap2-recall`） | **仅**召回副行；不与特辑叠行 |
| 4 | 结果·通关 | 周日完成今日 | 主毒舌可点名特辑；`growthLine`/smoother 仍至多一行（D-11） |
| 5 | 结果·认怂 | 周日放弃 | 周日认怂池；**不**嘲讽「浪费特辑」 |
| 6 | D-08·战报 | 周日拷贝战报 | 无「周日特辑」/ “Sunday Special”；数绘无图案名剧透 |
| 7 | D-06·平常日 | 设备改周一～六（或 **假日期·清除**） | 游戏页 + 结果页 **零** 特辑品牌词 |
| 8 | 数绘（可选） | 遇新图案日 | 揭示卡标题为双语文案，非 raw id |

Maestro（推荐自动化门禁）：

```bash
./scripts/maestro-v24-acceptance.sh
```

证据与签核见 [docs/qa/v2.4-sunday-special/README.md](./qa/v2.4-sunday-special/README.md)。

### v2.4.2 Ship（Content Depth）manual QA

验收矩阵：[v2.4.2-03-VERIFICATION.md](../.planning/phases/v2.4.2-03-ship-2-4-2/v2.4.2-03-VERIFICATION.md)。完整步骤与 Maestro 证据目录：[docs/qa/v2.4.2-ship/README.md](./qa/v2.4.2-ship/README.md)。

**前置：** `__DEV__` 开发包 + Metro `:8081`。周一抽样用 Simulator Date & Time（或已知周一 dateKey）；周日抽样用 Dev **假日期·周日**。进行中 keep **勿**中途点 Dev force 题型（会清今日存档）。

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 四题型 | Dev force 数独 / 二进制 / 数绘 / 数回，各至少一天可玩 | 棋盘可用；标题与题型一致 |
| 2 | 周一松 | Simulator 设已知周一（如 `2026-07-06` / `2026-07-13`）→ 杀 App 重开 | 周一难度抽样明显比周日松 |
| 3 | 周日紧 | Dev **假日期·周日**（或周日 dateKey） | 周日更紧 / 特辑路径仍一天一局 |
| 4 | 进行中 keep | 填几格 → 杀进程 / 重开（**不** force 题型） | 同盘同进度保留 |

Maestro（本 phase **必须** 证据，D-09）：

```bash
./scripts/maestro-v242-ship.sh
```

证据与签核见 [docs/qa/v2.4.2-ship/README.md](./qa/v2.4.2-ship/README.md)。

### v2.5 Ship（Adaptive Mastery）manual QA

验收矩阵：[v2.5-06-VERIFICATION.md](../.planning/phases/v2.5-06-ship-2-5-0/v2.5-06-VERIFICATION.md)。完整步骤与 Maestro 证据目录：[docs/qa/v2.5-ship/README.md](./qa/v2.5-ship/README.md)。SHIP-02 自动化覆盖：[SHIP-02-COVERAGE.md](./qa/v2.5-ship/SHIP-02-COVERAGE.md)。

**前置：** `__DEV__` 开发包 + Metro `:8081`。进行中 keep **勿**中途点 Dev force 题型（会清今日存档）。周一/周日抽样**非**本 phase 手测门禁。

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 四题型 | Dev force 数独 / 二进制 / 数绘 / 数回，各至少一天可玩 | 棋盘可用；标题与题型一致 |
| 2 | 进行中 keep | 填几格 → 杀进程 / 重开（**不** force 题型） | 同盘同进度保留 |
| 3 | 新鲜日期 create | 打开或强制一个尚未游玩的日期 | 更新后仍能成功创建谜题 |

Maestro（本 phase **必须** 证据，D-11）：

```bash
./scripts/maestro-v25-ship.sh
```

证据与签核见 [docs/qa/v2.5-ship/README.md](./qa/v2.5-ship/README.md)。

### v2.5-01 Composition manual QA

整页构图手测（LAYOUT-01..04 / EXP-01 / EXP-02）。建议 iPhone SE 或同等小屏各跑一遍数独 / 二进制 / 数绘 / 数回。

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 完成路径·顶栏 | 新开今日局 | 瘦身顶栏（日期/连签/计时器）；24pt 题型标题；不挡「完成今日」；（开场旁白已产品决策移除） |
| 2 | 完成路径·主 CTA | 合法完成后点「完成今日」 | 进入结果页；第一屏 punchline 主导；≤1 条子行；`结局`/`数据` 短标签；StatCard 在「数据」下 |
| 3 | 认怂确认 | 点弱化「认怂今日」 | BottomSheet 暖吐槽正文；主按钮「再撑一会儿」；次按钮「认怂」（非日落橙） |
| 4 | 认怂·取消 | Sheet 开着点「再撑一会儿」或点遮罩 | 留在游戏页；当日未结束 |
| 5 | 认怂·确认 | Sheet 点「认怂」 | 立即进结果页（无仪式停顿）；败局文案 |
| 6 | 周日副行 | 周日无进度 / 护盾或召回 | 至多一条副行（特辑/护盾/召回互斥）；**无**开场旁白 |
| 7 | 结果·折痕下 | 通关后下滑 | growth → StatsCards → soft-ask（首次合格通关仍可见）→ 月历 → 分享 → CTA |
| 8 | SE·数绘/数回 | 小屏开局 | 顶栏不挤占数绘线索带与数回棋盘可点区 |
| 9 | 首遇题型 scaffold | （本 phase 仅 checklist） | **占位 → v2.5-02 FEEL-05**：首遇题型可跳过操作演示；本 phase **不**实现 first-type demo |
| 10 | 月历周六列 | 结果页「查看本月」 | 周六列有日期且与表头「六」对齐（非空列） |

### v2.6-02 Feel + Mechanics manual QA（SHIP-02）

**前置：** `__DEV__` 开发包。自动化：`maestro test .maestro/flows/v26/v26-feel-smoke.yaml`（smoke）与 `v26-feel-device-qa.yaml`（拖填/热区）。**不含** DIFF-03 / SHIP-03。

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 四题型 | Dev force 数独 / 二进制 / 数绘 / 数回 | 各题型可开盘；顶栏题型名一致 |
| 2 | FEEL-01 Undo | 填一格 → 撤销；空栈时点撤销 | 撤销恢复；空栈控件 disabled（`撤销上一步编辑`） |
| 3 | FEEL-02 Notes | 数独开「笔记」→ 填候选 → 关笔记再填数字 → 完成/认怂 | 笔记不计入完成；完成校验只看数字 |
| 4 | FEEL-02 Persist | 同日笔记后杀进程重开 | `sudokuNotes` 保留；Undo 栈清空（ephemeral） |
| 5 | FEEL-03 Drag | 二进制/数绘一笔拖填 → 撤销一次 | 一笔 = 一次 Undo；竖滑仍可滚页 |
| 6 | FEEL-04 Hit | 数回点边中段 / 角落 | 可点；角落 H/V 消歧有上限（半径 20） |
| 7 | FEEL-05 Intro | 清 `@foolish-you/first-intro-v1` 后开新题型 | 首遇 BottomSheet；**跳过**立刻进盘；无 Hint / 不自动填答案 |
| 8 | FEEL-06 Haptics | 填格 / 冲突 / Undo / 认怂确认 | 有触感；无 Vibration+Haptics 双振 |
| 9 | D-24 | 全路径扫 UI | **无** Hint 入口、难度徽章、选题器 |

```bash
maestro test .maestro/flows/v26/v26-feel-smoke.yaml \
  --test-output-dir docs/qa/v2.6-02-feel-mechanics/evidence/$(date +%Y%m%d)
```

### v2.6-03 Signature manual QA（DIFF-03 / SHIP-02）

**前置：** `__DEV__` 开发包；Feel 手测（上节）已绿。可选 Maestro：既有 `.maestro/flows/v26/` complete→result 流仍应通过——**不要**用 Maestro 断言毫秒级帧/招牌动效时长。

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 8 变体·通关 | Dev force 四题型各一局 → 点「完成」 | 棋盘有题型物理解的通关招牌一刻（4 变体）；与导航并行；**footer 不当舞台** |
| 2 | 8 变体·认怂 | 四题型各开 → 放弃 → 确认认怂 | 确认后有认怂变体（另 4）；与结果页导航并行 |
| 3 | 峰值可读 | 通关 / 确认认怂瞬间 | 招牌峰值在导航首约 **100ms** 内可读；不抢戏结果页、无全屏闪白 |
| 4 | Haptics | 通关一次 / 认怂确认一次 | **通关一次** haptic、**认怂确认一次** haptic（FEEL-06）；无双振 |
| 5 | Reduce motion | 系统「减少动态效果」开 | 招牌仍可理解（降级可接受）；无卡死 |
| 6 | 四题 smoke | Dev force 数独 / 二进制 / 数绘 / 数回 | 均可开盘；Feel 控件仍可用 |
| 7 | 无 Hint | 全路径扫 UI（含首遇 sheet） | **无** Hint 入口、难度徽章、选题器 |

```bash
# Feel smoke（含 complete→result）；不断言招牌帧时序
maestro test .maestro/flows/v26/v26-feel-smoke.yaml \
  --test-output-dir docs/qa/v2.6-03-signature/evidence/$(date +%Y%m%d)
```

## Maestro E2E（v2.2）

**前提：** iOS Simulator 或 Android 模拟器已安装 **`com.moyunzero.foolish-you` 开发包**（非 Expo Go；与 `.maestro/flows/smoke-launch.yaml` 相同 `appId`）。Metro 可选（开发包已 bundle 时可离线跑 UI 流）。

```bash
# 单场景（截图 → evidence/YYYYMMDD/screenshots/）
maestro test .maestro/flows/v22/v22-growth-hot.yaml \
  --test-output-dir docs/qa/v2.2-gentle-growth/evidence/$(date +%Y%m%d)

# 全流程（8 场景 + 截图）
maestro test .maestro/flows/v22/v22-full-suite.yaml \
  --test-output-dir docs/qa/v2.2-gentle-growth/evidence/$(date +%Y%m%d)
```

Flows 使用 Dev **温和成长 QA** 场景 + **一键通关**（#5 为游戏页 **放弃**）；#7 先 **重置通关记录**；#8 经 Dev **预览·English**（等同设置页 locale 预览）。结果页交互前会自动 **隐藏调试条**（`隐藏调试条，便于截图`）。截图写入 `--test-output-dir` 下的 `screenshots/`，与 [验收证据 README](./qa/v2.2-gentle-growth/README.md) 对照表一并归档。

## Related docs

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](../AGENTS.md) | Production invariants, layer rules, verify entry points |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | CI commands, frontend CR, DevTools |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layers and data flow |
| [CONFIGURATION.md](./CONFIGURATION.md) | Storage keys and version bump checklist |
