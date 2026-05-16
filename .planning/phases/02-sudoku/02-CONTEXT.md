# Phase 2: 数独 - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

当 `dailySelector` 选出今日类型为 **数独** 时，用户可在 `app/game` 完成一整局标准 9×9 数独：可填/擦除、实时冲突反馈、主动完成或放弃，进度可续玩，胜负写入 `DailySnapshot` 并走既有 `/result` 分流。

**本阶段包含：** `lib/puzzles/sudoku/`（生成、校验、完成判定）、`SudokuGrid` + `game.tsx` 数独分支、扩展 `DailySnapshot` 题面与 `playState`、Jest 单测。

**本阶段不包含：** 二进制谜题（Phase 3）、结果页搞笑文案/动画（Phase 4）、提示/计时/铅笔备注、登录、后端。

当今日类型为 `binary` 时，`game.tsx` 可继续显示 Phase 1 占位，不要求本阶段实现 Binary Grid。

</domain>

<decisions>
## Implementation Decisions

### 输入与交互（SUDO-01）
- **D-01:** **点格选中 → 底部 1–9 数字条**填入；选中格再点数字可覆盖；提供明确「清除」操作擦掉用户填入（已知格不可改）。
- **D-02:** **v1 不做铅笔备注/候选数**；`playState` 仅存用户填数（0 表示空，1–9 为填入），不预留 notes 矩阵。
- **D-03:** **已知格锁定** — 题目给定数字视觉区分（更重字重/不可编辑态），点击仅高亮选中，不触发数字条改值。

### 冲突与错误反馈（SUDO-02）
- **D-04:** **实时冲突反馈** — 用户填入与同行、同列、同宫重复时，相关格用 `accent-sunset` 描边或浅底标出；**不阻止**继续填写（非强制纠错模式）。
- **D-05:** 冲突计算在 `lib/puzzles/sudoku/validate.ts`（纯函数）；UI 只消费冲突坐标列表。

### 难度与出题（SUDO-04、DAILY-05）
- **D-06:** **固定「中等」难度** — 约 **30** 个已知数（Planner 可在 `constants/config.ts` 配置为 28–32 区间）；`seed` 决定终盘变换与留白位置，不按日轮换 easy/hard。
- **D-07:** **必须唯一解** — 生成管线在 `removeClues` 时用 `countSolutions(limit: 2) === 1`；失败则递增子种子重试（上限可配置，避免主线程死循环）。
- **D-08:** 使用既有 **`mulberry32` / 派生种子**（`lib/puzzles/rng.ts`），禁止在生成路径使用 `Math.random()`。
- **D-09:** 生成结果写入 snapshot 的 **`puzzle`（给定数 + 可选 solution 仅 dev/测试）** 与 **`puzzleHash`**（稳定摘要），满足 DAILY-05 与 `lastPuzzleHash` 防连日复用（逻辑已在 Phase 1 `dailySelector`）。

### 局内存档（STOR-*、续玩）
- **D-10:** **支持杀进程续玩** — `DailySnapshot` 扩展 `playState: number[][]`（9×9，0=空）；用户每次有效改动 **防抖 ~300ms** 写入 AsyncStorage（与 ARCHITECTURE/PITFALLS 一致）。
- **D-11:** **题面完整写入 snapshot**（推荐默认；用户未对 persist 题单独表态）— hydrate 时直接恢复 `puzzle.givens`，不在每次打开重跑生成器（生成仅在跨日/new day 时执行一次）。

### 完成与放弃（SUDO-03、SUDO-04）
- **D-12:** **手动完成** — 81 格填满且 `isCompleteAndValid` 通过后，主按钮「完成今日」才可点；点击 → `markCompleted()` → `router.replace('/result')`。
- **D-13:** **放弃** — 保持 Phase 1：**「今天不玩了」** → `markAbandoned()` → `/result`，无二次确认弹窗。
- **D-14:** 填满但未合法时「完成今日」保持 disabled，可选轻量文案提示（Planner 定 copy，非 toast 打断）。

### 从 Phase 1 沿用（勿重议）
- 本地 `dateKey`、`playing`→`/game`、`completed|abandoned`→`/result`
- Expo SDK 54 + Expo Go、NativeWind、`DESIGN.md` / `01-UI-SPEC.md` 游戏屏布局
- `useDailyGame` / `DailyGameContext` 为编排入口；谜题逻辑仅在 `lib/puzzles/`

### Claude's Discretion
- `SudokuGrid` 是否拆 `useSudokuGame` hook（ARCHITECTURE 可选）
- 生成算法细节：终盘填充 + 对称挖空 vs 其他变换法，只要满足 D-06/D-07 与性能目标（PITFALLS：主线程 &lt;100ms 或 skeleton + `InteractionManager`）
- 数字条 UI：横排 9 钮 vs 3×3 小键盘，遵循 DESIGN 胶囊/描边
- `gameType === 'binary'` 时占位文案是否微调

</decisions>

<specifics>
## Specific Ideas

- 游戏屏延续 Phase 1：眉标 `今日 · dateKey`、Display 题型名、`HairlineCard` 包裹棋盘
- 冲突色使用已有 token `accent-sunset`（DESIGN.md）
- 底部：主按钮「完成今日」+ 次按钮「今天不玩了」

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 项目与需求
- `.planning/PROJECT.md` — 每日一局、离线、种子规则
- `.planning/REQUIREMENTS.md` — SUDO-01～04、DAILY-05、STOR-*
- `.planning/ROADMAP.md` — Phase 2 目标、成功标准、计划草案 02-01/02-02

### 调研
- `.planning/research/ARCHITECTURE.md` — `lib/puzzles/sudoku/`、`SudokuGrid`、`playState` 数据流
- `.planning/research/PITFALLS.md` — 唯一解、生成卡顿、单一 blob 持久化
- `.planning/research/STACK.md` — 纯 TS 数独引擎、Jest 在 Node 跑
- `.planning/research/FEATURES.md` — 数独表桩（冲突反馈、放弃、续玩）

### 设计
- `DESIGN.md` — 色板、字体、OutlinePillButton、HairlineCard
- `.planning/phases/01-foundation-daily-pipeline/01-UI-SPEC.md` — `game` 屏结构与占位

### Phase 1 上下文（集成约束）
- `.planning/phases/01-foundation-daily-pipeline/01-CONTEXT.md` — Expo Go、dateKey、路由分流

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/game.tsx` — 壳层、眉标、放弃流；替换虚线占位为 `SudokuGrid` 条件渲染
- `contexts/DailyGameContext.tsx` — `markCompleted` / `markAbandoned` / hydrate；需扩展 load/save 字段
- `lib/puzzles/rng.ts`、`dailySelector.ts` — 种子与题型；数独生成 consume `seed` 或派生子种子
- `lib/storage/dailyStorage.ts` — 版本化 JSON blob
- `components/ui/OutlinePillButton.tsx`、`HairlineCard.tsx` — 工具栏与棋盘外框
- `constants/design.ts` — 冲突色、字体 family

### Established Patterns
- `DailySnapshot` + `version` 字段；`puzzleStub.placeholder` 本阶段改为真实 `SudokuPuzzle` 结构
- 纯 `lib/` 单测（ts-jest + node），与 Phase 1 一致

### Integration Points
- `game.tsx`: `if (gameType === 'sudoku')` → `SudokuGrid` + 数字条 + 完成按钮
- `DailyGameContext`: hydrate 后若 `status === 'playing'` 且已有 `playState`，直接恢复网格
- 跨日：`dateKey` 变化时 `dailySelector` 重新生成（已有 Phase 1 逻辑）

</code_context>

<deferred>
## Deferred Ideas

- 铅笔备注 / 候选数 — 后续版本
- 撤销（Undo）— FEATURES 建议 post-MVP
- 提示、计时 — Phase 4 或更晚
- Binary Grid — Phase 3
- 结果页毒舌文案与 Reanimated — Phase 4
- 放弃二次确认 — 用户明确保持现状，不加入

</deferred>

---

*Phase: 02-sudoku*
*Context gathered: 2026-05-16*
