# Phase 2: 数独 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-16
**Phase:** 2-数独
**Areas discussed:** 输入方式、冲突反馈、难度与出题、局内存档、完成与放弃

---

## 输入方式

| Option | Description | Selected |
|--------|-------------|----------|
| A | 点格选中 → 底部 1–9 条 | ✓ |
| B | 先选数字再点格 | |
| C | 混合 + 长按擦除 | |

**User's choice:** A

### 铅笔备注

| Option | Description | Selected |
|--------|-------------|----------|
| 不要 | Phase 2 只做填数 + 冲突 | ✓ |
| 预留字段 | 结构预留 notes | |
| MVP 就要 | 铅笔模式 | |

**User's choice:** 不要

---

## 冲突与错误反馈

| Option | Description | Selected |
|--------|-------------|----------|
| A | 实时标红/描边冲突，不阻止继续填 | ✓ |
| B | 仅检查/完成时提示 | |
| C | 不标冲突 | |

**User's choice:** A

### 已知格

| Option | Description | Selected |
|--------|-------------|----------|
| 锁定 | 不可改，视觉区分 | ✓ |
| 可编辑 | 允许改题目数 | |

**User's choice:** 锁定

---

## 难度与出题

| Option | Description | Selected |
|--------|-------------|----------|
| A | 固定中等 ~30 已知数 | ✓ |
| B | 按种子分档难度 | |
| C | 随机已知数 | |

**User's choice:** A

### 唯一解

| Option | Description | Selected |
|--------|-------------|----------|
| 是 | countSolutions≤1，失败换种子 | ✓ |
| 尽力而为 | 可能多解 | |

**User's choice:** 是

---

## 局内存档

**User's choice:** *（问题被跳过 — 采用 research 推荐默认，已写入 CONTEXT D-10/D-11）*

| Option | Description | Selected |
|--------|-------------|----------|
| A | playState + 防抖 300ms 写入 | ✓（默认） |
| B | 不续玩 | |
| C | 仅后台时存一次 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 完整题面入 snapshot | hydrate 不重算 | ✓（默认） |
| 仅 seed | 每次再生 | |

---

## 完成与放弃

| Option | Description | Selected |
|--------|-------------|----------|
| A | 合法填满后「完成今日」可点 → result | ✓ |
| B | 自动跳转 result | |
| C | 必须点提交才校验 | |

**User's choice:** A

### 放弃

| Option | Description | Selected |
|--------|-------------|----------|
| 保持现状 | markAbandoned，无二次确认 | ✓ |
| 加确认弹窗 | | |

**User's choice:** 保持现状

---

## Claude's Discretion

- 生成算法实现细节、数字条布局、`useSudokuGame` 是否独立 hook
- 局内存档：用户跳过问答，采用 D-10/D-11 默认

## Deferred Ideas

- 铅笔备注、撤销、提示、计时 — 见 CONTEXT.md `<deferred>`
