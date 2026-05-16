# Phase 2 Research: 数独

**Researched:** 2026-05-16  
**Confidence:** HIGH（CONTEXT 锁定 + `.planning/research/*` + Phase 1 代码）

## Standard Stack（本阶段）

| 类别 | 选择 | 备注 |
|------|------|------|
| 谜题引擎 | 纯 TS `lib/puzzles/sudoku/` | 无 npm sudoku 库；Jest 在 Node 跑 |
| PRNG | 既有 `mulberry32` + `deriveSubSeed` | 禁止 `Math.random()` |
| UI | NativeWind + 现有 UI 组件 | `SudokuGrid` 新组件 |
| 持久化 | 扩展 `DailySnapshot` 同一 `STORAGE_KEY` | `playState` + 完整 `puzzle` |

## 推荐生成管线

```
deriveSubSeed(seed, 'sudoku')
  → mulberry32
  → fillCompleteGrid()        // 回溯填终盘
  → removeClues(target=30)    // 随机序挖空，每步 countSolutions≤1
  → 失败则 seed++ 重试（上限 e.g. 50）
  → puzzleHash = hash(givens)
```

**难度：** 固定 ~30 已知数（`constants/config.ts`：`SUDOKU_GIVEN_COUNT = 30`）。

**唯一解：** `countSolutions(grid, limit=2)` 在挖空与验收时使用（PITFALLS #7）。

## 模块划分

| 文件 | 职责 |
|------|------|
| `generator.ts` | `generateSudokuPuzzle(seed): SudokuPuzzle` |
| `solver.ts` | `solve`, `countSolutions` |
| `validate.ts` | `getConflictCells`, `isCompleteAndValid` |
| `hash.ts` | `computePuzzleHash(givens): string` |
| `types.ts`（或扩 `lib/puzzles/types.ts`） | `SudokuPuzzle`, `SudokuPlayState` |

## 与每日管道集成

1. **`dailySelector`：** `gameType === 'sudoku'` 时调用 `generateSudokuPuzzle(deriveSubSeed(seed,'sudoku'))`，写入真实 `puzzle` + `puzzleHash`；`binary` 暂保留 stub。
2. **`buildNewDaily`：** 已走 `selectDailyGame` — 扩展 selector 即可，Context 改动小。
3. **续玩：** hydrate 若 `record.dateKey === today` 且含 `playState`，直接恢复；**不**重跑生成器（CONTEXT D-11）。
4. **旧数据迁移：** 若 `puzzleStub?.placeholder === true` 且 `gameType === 'sudoku'`，用当日 `seed` 生成真实题面并写回（一次性升级）。

## UI 模式

- **交互：** 点格 → 底栏 1–9；清除按钮（CONTEXT D-01）。
- **冲突：** `validate.getConflictCells(playGrid, givens)` 每次变更后算，UI 描边（D-04）。
- **完成：** 满格且合法 → 启用「完成今日」→ `markCompleted()`（D-12）。

## Critical Pitfalls（本阶段必避）

1. 多解谜题 — 挖空时必须 `countSolutions === 1`
2. 主线程卡顿 — 生成 <100ms 目标；超限用 `InteractionManager.runAfterInteractions` + loading 骨架
3. 只存 seed 不存题面 — 必须持久化 `givens`（D-11）
4. playState 与 givens 不同步 — 单源：`playState` 仅用户格，已知数只读自 `puzzle.givens`
5. `puzzleHash` 仍为 `stub-v1` — 必须用 givens 哈希，否则 DAILY-05 失效

## Out of Scope

- 铅笔备注、撤销、提示、计时
- `SudokuGrid` 在 `binary` 日
- 结果页动效（Phase 4）

## Sources

- `.planning/phases/02-sudoku/02-CONTEXT.md`
- `.planning/research/ARCHITECTURE.md`, `PITFALLS.md`, `STACK.md`
- `lib/puzzles/rng.ts`, `dailySelector.ts`, `contexts/DailyGameContext.tsx`
