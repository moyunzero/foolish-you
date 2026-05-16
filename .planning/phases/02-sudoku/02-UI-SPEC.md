# Phase 2: 数独 — UI Design Contract

**Status:** Ready for planning  
**Extends:** `DESIGN.md`, `01-UI-SPEC.md`（`game` 屏骨架）  
**Gathered:** 2026-05-16

## Scope

仅当 `gameType === 'sudoku'` 时替换占位棋盘。`binary` 仍用 Phase 1 虚线占位。

---

## Sudoku Grid

| Element | Spec |
|---------|------|
| 容器 | 沿用 `HairlineCard` + `card-content` 内边距；棋盘 **aspect-square** 占满卡片宽度 |
| 网格 | 9×9；3×3 宫格用 **略粗 hairline**（`border-hairline` 或 1.5px）分隔；宫内细线 |
| 已知数 | `Inter` 600，`text-ink` |
| 用户填入 | `Inter` 400，`text-ink` |
| 选中格 | `bg-canvas-card` 或 1px `border-ink` 高亮 |
| 冲突格 | `border-accent-sunset` 或 `bg-accent-sunset/10`（与 CONTEXT D-04） |
| 已知格点击 | 仅选中高亮，**不**打开数字条改值 |

---

## Numpad（底部工具区）

| Element | Spec |
|---------|------|
| 布局 | 横排 **9 个** outline 小胶囊（1–9），等分或 `flex-wrap`；下方或右侧 **清除**（outline，`body-sm`） |
| 样式 | 与 `OutlinePillButton` 一致：透明底 + hairline + `rounded-full` |
| 禁用态 | 未选中可编辑格时，数字条整体 `opacity-40` + `pointerEvents: none` |
| 触控目标 | 最小 44×44 pt |

---

## Game Screen Actions（数独分支）

| Control | Style | State |
|---------|-------|-------|
| **完成今日** | `button-primary`（白底黑字胶囊） | `disabled` 直至 81 格满且 `isCompleteAndValid` |
| **今天不玩了** | `button-outline-on-dark` | 始终可点（CONTEXT D-13） |
| ~~先看看题目~~ | 移除或隐藏（Phase 1 占位 disabled） | — |

---

## Copywriting（数独）

| Element | Copy |
|---------|------|
| 完成按钮 | **完成今日** |
| 清除 | **清除** |
| 未完成提示（可选，`body-sm muted`） | **还有格子没填对** |
| binary 占位 | **二进制谜题 · Phase 3 开放**（微调文案即可） |

---

## Visual Hierarchy（game · sudoku）

1. Display 题型「数独」  
2. `SudokuGrid`（焦点）  
3. Numpad  
4. 主 CTA「完成今日」  
5. 次 CTA「今天不玩了」

---

## Accessibility

- 格与数字条具备 `accessibilityLabel`（如「第 3 行第 5 列，已填 7」）
- 冲突格 `accessibilityState={{ selected: true }}` + hint「与同行冲突」

---

*Phase: 02-sudoku*
