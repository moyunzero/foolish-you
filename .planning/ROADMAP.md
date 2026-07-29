# Roadmap: 傻了么 (Silaomo)

## Overview

从空仓库到可玩的每日益智 MVP：先搭建 Expo 骨架与「今日游戏」管道，再分别交付数独与二进制谜题，最后补上结果页幽默反馈与动效，形成「打开 → 玩 → 嘲讽/鼓励 → 明天见」的完整闭环。

**v1.0 已交付（2026-05-16）** · **Nonogram（2026-05-25）** · **v1.1 / v1.2 已发布** · **v2.1 App Store 已上架（`2.1.0`，2026-06-09）** · **v2.2 `2.2.0`** · **v2.3 `2.3.0`** · **v2.4 `2.4.0` 已上架（2026-07-15）** · **v2.4.2 repo ready** · **Composition 已合入（现标 v2.6-01）**。  
**当前执行里程碑：v2.5 Adaptive Mastery**（适应性掌握度）。原 Host-Crafted FEEL/DIFF-03 改标 **v2.6** 并暂停。留存 KPI 待 **App Store Connect Analytics** 采集（应用内无 analytics SDK）。

## Phases

- [x] **Phase 1: 基础骨架与每日管道** — Expo、路由、日期种子、存储、入口分流
- [x] **Phase 2: 数独** — 生成器、网格 UI、校验与完成/放弃
- [x] **Phase 3: 二进制谜题** — 生成器、网格 UI、规则校验
- [x] **Phase 4: 结果体验与打磨** — 搞笑文案、动画、本局计时（approved 2026-05-16；无提示）
- [x] **Phase Nonogram: 数绘** — 引擎 + 30 个 8×8 图案 + 结果页揭示卡（2026-05-25）
- [x] **Phase v1.1: 留存基本盘**（4 plans 已交付；目标 D1 32% · D7 12% · 评分 4.4 — 待线上数据）
- [x] **Phase v1.2: 国际化** — 系统 zh/en、Brainfool 品牌、双语隐私、Dev 语言预览（无正式版设置 UI；2026-05-31 代码核对）
- [x] **Phase v2.0: Streak 升级与习惯锚点**（v20-01 + v20-04 已签收；D7 AB 待公测）
- [x] **Phase v2.0-slitherlink: 第四题型 · 数回 7×7**（2026-06-01：**5 plans 全量交付**；与 streak 可并行）
- [x] **Phase v2.0-closeout: CONCERNS 签收与发版门槛**（iOS `2.1.0` 已上架 2026-06-09；Google Play pending）
- [x] **Phase v2.1: 内容深度**（6 plans；**shipped** App Store `2.1.0` 2026-06-09）
- [x] **Phase v2.2: 温和成长（掌控感）** — 结果页近况文案 + 月历成长口吻 + gameType 埋点（3 plans；**shipped** App Store `2.2.0`）
- [x] **Phase v2.3: 同类更顺彩蛋** — 同玩法纵向正向反馈；节奏优先、单行、永不负反馈（**shipped** App Store `2.3.0`）
- [x] **Phase v2.4: 周日特辑 + 数绘扩充**（主：周日仪式感；辅：数绘图案库；**shipped** App Store `2.4.0` 2026-07-15）
- [x] **Phase v2.6-01: Composition（整页构图）** — 原 v2.5-01；游戏页/结果页舞台化 (completed 2026-07-22；dir `v2.6-01-composition`)
- [x] **Phase v2.4.2-01: Band Retune（难度带）** — 数独/二进制/数回周节奏拉宽 + 变盘修复路径测试 (completed 2026-07-27)
- [x] **Phase v2.4.2-02: Nonogram Expand（数绘扩库）** — 90→exactly 120 append-only + zh/en 标题 + SHIP-02 silly-face fixture (completed 2026-07-27)
- [x] **Phase v2.4.2-03: Ship 2.4.2（发版签核）** — 营销版本 bump + 变盘披露文案 + QA (completed 2026-07-28)
- [x] **Phase v2.5-01: Mastery Foundation** — FSRS-lite 存储 + 日历轻调 + 当日冻结 (completed 2026-07-28)
- [x] **Phase v2.5-02: Sudoku Technique Rater** — 四档技巧门控 + 生成接受环 (completed 2026-07-28)
- [x] **Phase v2.5-03: Binary + Slitherlink Raters** — 技巧梯映射四档 (completed 2026-07-29; GAP-D24 closed via D-24 7×7 re-lock)
- [x] **Phase v2.5-04: Nonogram Tiering** — 库内分档 + 按档选取 (completed 2026-07-29)
- [ ] **Phase v2.5-05: Dedupe + Diversity + Wire** — hash 环 + 选题接入 mastery
- [ ] **Phase v2.5-06: Ship 2.5.0** — 披露 + 测试 + VERIFICATION

> **Paused（v2.6 Host-Crafted 剩余，Adaptive 之后恢复）：**  
> - Phase v2.6-02 Feel + Mechanics（FEEL-01..06）  
> - Phase v2.6-03 Signature **DIFF-03 only**

> **Deferred：** 第五玩法（`TYPE-01`）— 见 `.planning/REQUIREMENTS.md` Future Requirements

- [ ] **Phase v3.0: 跨端，但慎入账号**（3 plans；挂起至丢档反馈或 Android 首发）
- [ ] **Phase v4.0: 极克制的伙伴感**（2 plans，仅在 v2 数据验证后启动）

## Phase Details

### Phase 1: 基础骨架与每日管道

**Goal**: 用户打开 App 能看到今日应玩的游戏类型（占位或最小谜题），状态可跨重启保留，跨日自动刷新。  
**Depends on**: Nothing  
**Requirements**: DAILY-01..04, STOR-01..03, NAV-01..02, AUTH-01..02  
**UI hint**: yes  
**Success Criteria**:

  1. 用户安装后可在真机/模拟器启动 App，无崩溃
  2. 同一天多次打开看到相同 `date` + `type` + `seed`（已持久化）
  3. 修改系统日期到次日（或模拟）后，自动出现新的今日记录
  4. 今日已标记完成/放弃时，入口不再进入可玩态
  5. 无网络时可完成上述流程

Plans:

- [x] 01-01: 初始化 Expo + expo-router + NativeWind + 目录结构
- [x] 01-02: `lib/date.ts`、`lib/storage.ts`、`dailySelector` 与类型定义
- [x] 01-03: `useDailyGame` + index/game/result 路由分流（game 可占位）

### Phase 2: 数独

**Goal**: 数独作为今日游戏类型时可完整游玩并判定胜负。  
**Depends on**: Phase 1  

Plans:

- [x] 02-01: `lib/puzzles/sudoku/*`（生成、唯一解验证）+ 单元测试
- [x] 02-02: `SudokuGrid` 组件 + `game.tsx` 数独分支 + 结果页（approved 2026-05-16）

### Phase 3: 二进制谜题

**Goal**: Binary Puzzle 作为今日类型时可完整游玩并判定胜负。  
**Depends on**: Phase 2  

Plans:

- [x] 03-01: `lib/puzzles/binary/*` + 规则校验 + 测试
- [x] 03-02: `BinaryGrid` + `game.tsx` binary 分支 + 规则弹窗（approved 2026-05-17）

### Phase 4: 结果体验与打磨

**Goal**: 完成/放弃后的情绪反馈到位，MVP 可对外试玩。  
**Depends on**: Phase 3  

Plans:

- [x] 04-01: `resultMessages` + 结果页 Reanimated 动效（approved 2026-05-16）
- [x] 04-02: 计时 + `GameToolbar`（approved 2026-05-16；提示已移除）

### Phase Nonogram: 数绘接入

**Goal**: 第三题型上线：手写引擎 + 静态图案库 + 揭示卡。  

详见 `.planning/phases/nonogram/PLAN.md`，2026-05-25 完成。

---

## v1.1 起：留存提升阶段

### 设计宪法（红线，不可破）

| 不做 | 原因 |
|------|------|
| 排行榜 / 好友 / IM | 与「无社交、专注今天这一局」正面冲突；运营/审核成本高 |
| IAP / 广告 | 品牌骨气；保持「毒舌但不算计」的产品调性 |
| 一天 ≥ 2 局 | 稀释「今天就这一局」的张力，反而降低分享欲 |
| 提示按钮（hint）| 与「认怂」机制冲突，破坏失败的喜剧效果（GAME-02 已被用户明确否决）|
| 超过 2 张的 streak freeze | Duolingo 实测：3 张的边际收益为 0（Lenny's Newsletter, 2024）|
| 远程下发盘面 | 违反离线优先；引入了不必要的 SLA 与隐私顾虑 |
| 自建账号 + 后端跨设备同步 | 与定位冲突，详见 v3 决策备忘 |

### 2026 留存与好评关键数据（决策依据）

| 指标 | 行业中位（手游） | Top 25% | Puzzle 子类 | 来源 |
|------|------------------|---------|-------------|------|
| D1 | 22 – 26% | 35 – 40% | 31.85% | GameGrowthAdvisor 2026 |
| D7 | 4 – 7% | 15 – 20% | 12.80% | 同上 |
| D30 | 0.7 – 2.3% | 7 – 10% | 5.35% | 同上 |
| 评分基准 | 4.0 – 4.3 | ≥ 4.5 | — | AppDrift 2026 |
| 评分敏感度 | 掉 0.1 星 → 自然下载 –5%~10% | — | — | AppMarketingPlus 2026 |
| 中国休闲首日卸载率 | 65% | — | — | CDA 2026 |

**关键产品复盘：**

- **Wordle**：90 → 300K DAU（2 个月）核心驱动是「一键复制 emoji 方格 + 不剧透」（Growth Memo / Semetrical 2026）。
- **Duolingo Streak**：「公司最大单一留存特性」。7 天 streak 用户次日留存 2.4×；streak freeze 让 7 天后平均 streak 寿命 **11.62 → 17.19 天（+48%）**；3 张并不优于 2 张（Trophy 2026 / Lenny's Newsletter）。
- **NYT Connections**：stats + streak 让 300 万人每天打卡；2024 上线 stats 即被官方称为「留存深化关键节点」（NYTCo Press）。
- **推送 2026 共识**：pre-permission soft ask 让 opt-in 从 40% → 70-85%；超过 2 条/日 → 46% 用户关推送；71% 卸载发生在推送触发后（Tencent/Newly/Boundev/Reteno 2026）。

### 北极星与季度目标

| 阶段 | D1 | D7 | D30 | 评分 | 完成→分享率 |
|------|----|----|-----|------|--------------|
| 当前（v1.2 已发版，未公测） | — | — | — | 未公测 | — |
| **v1.1 目标（3 月）** | 32% | 12% | 5% | ≥ 4.4 | ≥ 3% |
| **v2.0 后（6 月）** | **35%+** | **15%+** | **7%+** | **≥ 4.5** | ≥ 5% |
| 12 月 | 38% | 18% | 9% | 4.6 | 7% |

---

### Phase v1.1: 留存基本盘

**Goal**: 在不破坏离线优先与极简定位的前提下，把最高 ROI 的 4 件事先做完。  
**Depends on**: v1.0 + Nonogram 已交付  
**Success Criteria**:

  1. 结果页可一键复制「emoji 战报」，剪贴板内容不剧透（无原图、无答案）
  2. 评分弹窗仅在「通关 + 已通关累计 ≥ 3 次 + 当前 streak ≥ 2」时触发，且 90 天内不重复
  3. 结果页固定显示 3 个数据小卡片，不连网
  4. 任何 storage migration 路径在「老快照 / 损坏快照 / 跨日 / 跨题型」四种场景下都通过单测
  5. `npm run typecheck && npm test && npm run lint` 全绿

**Plans:**

- [x] **v11-01**: 结果页 emoji 战报拷贝（Wordle 式 🟩🟨⬛ 方格 + 题型 + 用时 + dateKey）
- [x] **v11-02**: 评分弹窗（StoreReview API + 触发时机硬约束）
- [x] **v11-03**: 结果页三数据小卡（今日用时 / 本周完成数 / 历史最长连签）
- [x] **v11-04**: 防御性自检与迁移单测（盘面有解、计时漂移、snapshot 损坏）

详见 `.planning/phases/v1.1-retention-baseline/` 下四张计划卡。验收：[`v11-VERIFICATION.md`](./phases/v1.1-retention-baseline/v11-VERIFICATION.md)

---

### Phase v1.2: 国际化（无独立 ROADMAP phase 历史；此处补录）

**Goal**: 系统语言 zh/en、英文品牌 **Brainfool**、双语隐私；正式版不提供语言设置 UI。  
**Depends on**: v1.1  
**Detail**: [`.planning/phases/12-v1.2-i18n/PLAN.md`](./phases/12-v1.2-i18n/PLAN.md) · 验收 [`12-VERIFICATION.md`](./phases/12-v1.2-i18n/12-VERIFICATION.md)

---

### Phase v2.0: Streak 升级与习惯锚点

**Goal**: Streak Freeze + 应用内缺勤召回（Discuss 收窄 scope；推送/统计页见 v2.1）。  
**Depends on**: v1.1 全部 approved + 至少 4 周线上数据  
**Discuss**: [`.planning/phases/v2.0-streak-habits/CONTEXT.md`](./phases/v2.0-streak-habits/CONTEXT.md)  
**Success Criteria**:

  1. Streak Freeze 系统按规则下发/消耗，对老用户做平滑迁移（已有 streak 不丢）
  2. 「昨日错过」首页一行召回：缺勤次日出现，当日完成/放弃后消失；中英 copy
  3. AB 验证：v2.0 上线 4 周内 D7 提升 ≥ 3pp（相对 v1.1 基线）；Freeze 0 vs 2 子实验

**Plans (v2.0 ship):**

- [x] **v20-01**: Streak Freeze（每周自动发 1 张，最多堆 2 张；打开 App reconcile；**档位 C UX** — 见 [`v20-01-PLAN.md`](./phases/v2.0-streak-habits/v20-01-PLAN.md) · [`v20-01-SUMMARY.md`](./phases/v2.0-streak-habits/v20-01-SUMMARY.md))
- [x] **v20-04**: 「昨日错过」首页极小一行毒舌召回 — 见 [`v20-04-PLAN.md`](./phases/v2.0-streak-habits/v20-04-PLAN.md) · [`v20-04-SUMMARY.md`](./phases/v2.0-streak-habits/v20-04-SUMMARY.md)

验收：[`v2.0-streak-habits/VERIFICATION.md`](./phases/v2.0-streak-habits/VERIFICATION.md) · closeout [`v2.0-closeout/VERIFICATION.md`](./phases/v2.0-closeout/VERIFICATION.md)

**Deferred → v2.1**（Discuss 2026-05-31）:

- **v20-02** 每日提醒推送 — 建议等 v1.1 四周数据；若 D7 仍差且「忘记打开」为主因再 AB（见 CONTEXT）
- **v20-03** 个人统计页 — 与 v21-02 日历等合并规划

**AB 实验设计：**

| 实验 | 对照 | 处理 | 主指标 | 决策 |
|------|------|------|--------|------|
| Freeze 上限 | 0 | 2 | 14 天后 streak 寿命 | 显著正向才保留 2 张；试 3 张作为 ceiling check |
| 推送时间 | 用户选 | 系统智能（首次启动时段 ±15min） | 推送 → 当日完成率 | **v2.1+**（v2.0 不含推送） |
| 召回文案 | 「你昨天没碰它，它也没生气」 | 「昨天断了 1 天，今天接上还来得及」（loss frame） | 召回率 | 数据胜出者保留；不允许两条同时出现 |

---

### Phase v2.0-slitherlink: 第四题型 · 数回 (Slitherlink 7×7)

**Goal:** 上线第四种每日题型，与数独/二进制/数绘 **同等完整度**（polyomino 环生成器、边交互 UI、冲突反馈、持久化、双语规则、战报、结果 Reveal）。**不砍 scope。**

**Depends on:** v1.2 i18n  
**Parallel with:** v2.0-streak-habits  
**Discuss / Plan:** [CONTEXT.md](./phases/v2.0-slitherlink/CONTEXT.md) · [PLAN.md](./phases/v2.0-slitherlink/PLAN.md) · [UI-SPEC.md](./phases/v2.0-slitherlink/UI-SPEC.md)

**Success Criteria:**

  1. `dailySelector` 四题型等权；同 `dateKey` 稳定；`selectDailyGameSafe` 真可解
  2. 边三态游玩 + 即时冲突 + 完成/认怂 + 杀进程恢复
  3. 结果页胜利 Reveal 环动画 + emoji 战报（无 solution 泄漏）
  4. snapshot validate 四场景单测；**不 bump** `STORAGE_VERSION`
  5. CI 全绿 + iOS/Android 手动 QA 矩阵（见 VERIFICATION.md）

**Plans:**

- [x] **v20-sl-01**: 引擎（spec / edges / solver / generator / validate / hash）
- [x] **v20-sl-02**: 每日管道（types / dailySelector / fallback / snapshot / hydrate）
- [x] **v20-sl-03**: 玩法 UI（SlitherlinkBoard + hook + Section + game.tsx）
- [x] **v20-sl-04**: 产品化（i18n / 规则 / share / Reveal / DevTools）
- [x] **v20-sl-05**: 验收（集成测试 / CI / VERIFICATION / README 最小更新）

---

### Phase v2.1: 内容深度（不是功能爬墙）

**Goal**: 给老玩家「上瘾感」，但绝不破坏「今天就这一局」张力。  
**Depends on**: v2.0-closeout 签收 + v2.0 至少 4 周线上数据（Discuss 2026-06-08）  

**Discuss / Plan:** [v2.1-CONTEXT.md](./phases/v2.1-content-depth/v2.1-CONTEXT.md) · [PLAN.md](./phases/v2.1-content-depth/PLAN.md) · [UI-SPEC.md](./phases/v2.1-content-depth/v2.1-UI-SPEC.md)

**Success Criteria:**

  1. 周节奏难度 Mon→Sun（题型内分级；无 UI 难度标签）；`APP_SALT` 不变
  2. 结果页「查看本月」→ 四态月历 Sheet + 连签/本月通关摘要（无 Dashboard）
  3. A+D 提醒漏斗 + 1 条 routine 本地推送 + ReminderSheet（无 Release Settings）
  4. 月历底图鉴长图可 Share
  5. completion history v2 + streak v4 migration 通过
  6. CI 全绿 + VERIFICATION.md 手测矩阵

**Plans:**

- [x] **v21-01**: 周节奏难度（周一最易 → 周日最难；隐藏 band）
- [x] **v21-02**: 本月月历 Sheet + storage v2/v4（合并 v21-04 摘要）
- [x] **v21-05**: 每日提醒（expo-notifications；A+D 漏斗）
- [x] **v21-03**: 月度图鉴长图
- [x] **v21-06**: 阶段验收（CI + VERIFICATION + 手测矩阵）

**Wave 0 gate:** [v2.0-closeout](../v2.0-closeout/VERIFICATION.md) EAS 真机 QA — 未签收前不启动 v2.1 编码。

**Deferred（Discuss）：** v21-04 独立统计页 → 已合并进 v21-02；v20-02 推送 → v21-05。

---

### Phase v2.3: 同类更顺彩蛋（Same-Type Smoother）

**Goal**: 在 v2.2 温和成长之上，当同 `gameType` + 同 `weekdayBand` 样本足且今日通关明显更快时，结果页显示一句纯定性暖毒舌彩蛋；**节奏优先、单行、永不负反馈**。  
**Depends on**: v2.2 shipped（`2.2.0`）+ `gameType` 埋点数据开始积累  
**Discuss**: [`.planning/phases/v2.3-same-type-smoother/v2.3-CONTEXT.md`](./phases/v2.3-same-type-smoother/v2.3-CONTEXT.md)

**Success Criteria:**

  1. 判定链：召回/火热/稳定优先；仅沉默时评估 smoother；认怂不触发
  2. 样本：≥3 局同 `gameType` + 同 `weekdayBand`；`undefined gameType` 跳过
  3. 今日 `elapsedMs` ≤ 历史中位数 × 0.75 → tone `smoother` + i18n pool
  4. 四玩法统一；无存储 migration；无负向/数字 PK 文案
  5. Dev QA + Maestro 扩展；CI 全绿

**Plans:** [PLAN.md](./phases/v2.3-same-type-smoother/PLAN.md) — v23-01（逻辑）+ v23-02（文案/QA）；Discuss 2026-06-29；**shipped** `2.3.0` 2026-07

---

### Phase v2.4: 周日特辑 + 数绘扩充

**Goal**: 用 **周日特辑** 强化「每周约会感」（直接押 D7），并用 **数绘图案库扩充** 补上四题型中最薄的内容短板；**仍保持一天一局**。第五玩法明确推迟到 v2.5。  
**Depends on**: v2.3 shipped（`2.3.0`）  
**Decision (2026-07-14):** 否决「第五玩法 *或* 周日特辑」并列；改为 B+C（周日特辑主 + 数绘扩充辅）。依据：数回参考成本 ~5 plans、等权随机摊薄新鲜感；周日已有 `weekdayBand=6` 地基；数绘仅 ~30 个静态 8×8 图案。  
**Discuss**: [`.planning/phases/v2.4-sunday-special/v2.4-CONTEXT.md`](./phases/v2.4-sunday-special/v2.4-CONTEXT.md)（2026-07-14）

**Success Criteria:**

  1. 周日（本地 `dateKey` → `weekdayBand === 6`）有可识别的「特辑」体验：选题/难度/视觉或文案至少一层仪式感；**不**变成第二局或用户自选题型
  2. `APP_SALT` / 日常确定性不变：同一 `dateKey` → 同一题型与盘面（特辑规则写入确定性选题，而非热路径随机）
  3. 数绘图案库显著扩充（目标 ≥ 当前约 2×），各 `tier` 0–6 覆盖仍可用；无答案泄漏到战报/图鉴
  4. 红线不变：一天一局、无 hint、无社交、离线优先、无远程盘面
  5. CI 全绿 + VERIFICATION 手动矩阵（iOS；Android 仍可选）

**Plans:** 3/3 plans executed — **shipped** `2.4.0` 2026-07-15

Plans:
**Wave 1**

- [x] v24-01-PLAN.md — 周日特辑 copy-only：副行优先级 + 结果毒舌周日池（D-01..D-12）
- [x] v24-02-PLAN.md — 数绘图案库 ≈90 追加 + zh/en titleKey + tier 均衡（D-13..D-17, D-20）

**Wave 2** *(blocked on Wave 1 completion)*

- [x] v24-03-PLAN.md — CI + VERIFICATION + iOS 手测签核（SC-01..05）

**Out of this phase:** 第五玩法（→ v2.5）；QR/备份（→ v3.0）；新广告/IAP/社交。

---

### Phase v2.6-01: Composition（整页构图）

**Status:** Complete（2026-07-22）。原编号 v2.5-01；2026-07-28 产品口径改标 **v2.6**；目录 `phases/v2.6-01-composition/`。  
**Goal**: 游戏页/结果页舞台化（主持人构图）。  
**Depends on**: v2.4  

Plans:

- [x] v2.6-01-01-PLAN.md — Copy pools + hasPlayProgress + slim header/host intro fade + demoted abandon footer
- [x] v2.6-01-02-PLAN.md — Result punchline-first + 结局/数据 + Abandon BottomSheet + EXP-01 checklist

---

### Phase v2.5-01: Mastery Foundation

**Goal**: 分题型掌握度可持久化；遗忘曲线更新；日历仅轻调；当日盘面冻结。  
**Depends on**: v2.4.2-03 complete  
**Requirements**: MAST-01, MAST-02, MAST-03, MAST-04  
**UI hint**: no  
**Success Criteria**:

  1. 新装用户四种题型均有默认 Easy 向掌握度，可读写且经 migration 校验
  2. 完成/放弃后该题型掌握度按遗忘曲线规则变化（可用单元测试固定时钟验证）
  3. 同一 `dateKey` 首次创建后改 mastery 不改变已写入 snapshot 的 puzzleHash
  4. 日历 band 对目标档的偏移不超过 ±1（或仅档内参数轻推）

**Plans:** 2/3 complete (1 gap-closure pending)

Plans:

- [x] v2.5-01-01-PLAN.md — DifficultyTier + FSRS-lite + resolveTargetTier + masteryStorage (MAST-01..03)
- [x] v2.5-01-02-PLAN.md — persistStatus wire + same-day freeze regression (MAST-02, MAST-04)

---

### Phase v2.5-02: Sudoku Technique Rater

**Goal**: 数独按四档技巧峰值接受/拒绝生成盘，线索数为引导非唯一标准。  
**Depends on**: v2.5-01  
**Requirements**: TIER-01, TIER-02  
**Success Criteria**:

  1. Fixture 盘面被 rater 分到与标注一致的档位
  2. 生成循环在合理次数内产出目标档唯一解盘
  3. Expert 档有 CPU/步数预算，超时则降级重试而非卡死

**Plans:** 3/3 plans complete

Plans:

- [x] v2.5-02-01-PLAN.md — Candidates + technique ladder + rateSudoku fixtures (TIER-01/02 rater)
- [x] v2.5-02-02-PLAN.md — generateSudokuPuzzleForTier accept/soften loop (TIER-02 gen)
- [x] v2.5-02-03-PLAN.md — Gap closure: sound short_chain + conflict-checked solved + expectedPeak (CR-01/WR-01/WR-02)

---

### Phase v2.5-03: Binary + Slitherlink Raters

**Goal**: 二进制与数回具备与四档对齐的技巧门控。  
**Depends on**: v2.5-02（复用门控模式）  
**Requirements**: TIER-03, TIER-05  
**Success Criteria**:

  1. 各档至少一组 fixture 分类正确
  2. 生成/参数路径能稳定命中目标档（含 fallback）

**Plans:** 2/2 plans complete — VERIFICATION **passed** (GAP-D24 closed)

Plans:

- [x] v2.5-03-01-PLAN.md — Binary full depth: technique ladder + rateBinary + generateBinaryPuzzleForTier (TIER-03)
- [x] v2.5-03-02-PLAN.md — Slitherlink full depth: technique ladder + rateSlitherlink + generateForTier no-builtin + demote 3-way guides (TIER-05)

---

### Phase v2.5-04: Nonogram Tiering

**Goal**: 120 图案库按四档标记/评级，选题按目标档过滤。  
**Depends on**: v2.5-01  
**Requirements**: TIER-04  
**Success Criteria**:

  1. 每档可用图案数量可审计（避免空档）
  2. 目标档选取失败时有相邻档 fallback 且可测

**Plans:** 2/2 plans complete

Plans:

- [x] v2.5-04-01-PLAN.md — Nonogram rater: FullSettle + bounded probe + four peak fixtures (TIER-04)
- [x] v2.5-04-02-PLAN.md — Freeze difficultyTier on 120 + generateNonogramPuzzleForTier soften (TIER-04)

---

### Phase v2.5-05: Dedupe + Diversity + Wire

**Goal**: 历史 hash 去重 + 同档多样性；selector/Context 全链路接入 mastery。  
**Depends on**: v2.5-02..04  
**Requirements**: DIV-01, DIV-02, TIER-01（接线）  
**Success Criteria**:

  1. 近期玩过的 hash 在重试上限内被避开
  2. 完成一局后 mastery 与 hash ring 一并持久化
  3. hydrate 路径使用 mastery 解析目标档

**Plans:** 3 plans

Plans:
- [ ] v2.5-05-01-PLAN.md — Played-hash ring storage (200 FIFO/type) + CONFIGURATION
- [ ] v2.5-05-02-PLAN.md — Selector forTier + avoid loop + hydrate mastery wire
- [ ] v2.5-05-03-PLAN.md — Complete dual-write append + MAST-04 freeze regression

---

### Phase v2.5-06: Ship 2.5.0

**Goal**: 营销版本 `2.5.0` + 变盘披露 + 验证签核。  
**Depends on**: v2.5-05  
**Requirements**: SHIP-01, SHIP-02  
**Success Criteria**:

  1. What's New / CONFIGURATION 披露未玩过日期可能变盘
  2. CI：typecheck + test + migration + lint 绿
  3. VERIFICATION 签核

Plans: TBD via `/gsd-plan-phase v2.5-06`

---

### Phase v2.4.2-01: Band Retune（难度带）

**Goal**: 在现有周节奏上拉宽数独/二进制/数回难度带，使周一明显更松、周日明显更紧；配套「进行中快照不被静默换盘」回归测试。  
**Depends on**: Composition shipped in codebase（本阶段不改 UI）  
**Requirements**: BAND-01, BAND-02, BAND-03, SHIP-02  
**UI hint**: no  
**Success Criteria**（用户可观察 / 可验证）:

  1. 同一周内 Mon vs Sun：数独/二进制 givens 差明显大于 2.4.1（目标带 35→24 / 28→18），且每日仍唯一解
  2. 数回 Mon（easy）与 Sun（hard）在线索密度/环形状参数上可区分，规则与 7×7 UI 不变
  3. `APP_SALT` 与题型选择逻辑未改；同版本内同 `dateKey` 仍确定性复现
  4. 「未通关快照 + 生成参数已变」场景下，修复路径测试通过，不会静默换成另一盘面

**Plans:** 2/2 plans complete

Plans:
**Wave 1**

- [x] v2.4.2-01-01-PLAN.md — SHIP-02 four-type keep lock + Sudoku/Binary 35→24 / 28→18

**Wave 2** *(blocked on Wave 1 completion)*

- [x] v2.4.2-01-02-PLAN.md — Slitherlink per-day bandLerp + soft dig + timing/builtin gates

---

### Phase v2.4.2-02: Nonogram Expand（数绘扩库）

**Goal**: 数绘静态库从 90 扩到正好 120（全 8×8），只追加、不改前缀；新图有双语标题；tier 精确均衡 17/17/17/17/17/17/18（CONTEXT D-01..D-03 覆盖 ROADMAP 旧软区间）。  
**Depends on**: Phase v2.4.2-01（可并行，但建议难度带先落地）  
**Requirements**: NONO-01, NONO-02  
**UI hint**: no  
**Success Criteria**:

  1. `NONOGRAM_PATTERNS.length === 120`；前 90 条 id/顺序与 2.4.x 一致（append-only，D-01/D-09）
  2. 各 tier 精确直方图 `[17,17,17,17,17,17,18]`（D-02/D-03 — 不允许 ±1）
  3. 新图案均可通过现有 generator 选出并完成；`titleKey` 在 zh/en locales 有对应文案（NONO-02）
  4. 单元测试覆盖前缀锁定 + 精确库大小；SHIP-02 nonogram fixture 升级为 silly-face + stale hash（D-12..D-14）

**Plans:** 2/2 plans complete

**Wave 1**

- [x] v2.4.2-02-01-PLAN.md — RED exact catalog asserts + GREEN append 30 patterns + zh/en titles

**Wave 2** *(blocked on Wave 1)*

- [x] v2.4.2-02-02-PLAN.md — Upgrade stale-playing-nonogram to silly-face + deliberate stale hash

---

### Phase v2.4.2-03: Ship 2.4.2（发版签核）

**Goal**: 营销版本落到 `2.4.2`，发版说明披露跨版本变盘，手测/清单签核可上架。  
**Depends on**: Phase v2.4.2-01, Phase v2.4.2-02  
**Requirements**: SHIP-01, SHIP-03  
**UI hint**: no  
**Success Criteria**:

  1. `app.json`（及必要的 store 元数据）版本为 `2.4.2`
  2. 发版说明（中/英至少一处对用户可见或对审可用）写明：更新后尚未游玩的日期盘面可能变化
  3. `npm run typecheck && npm test && npm run test:migration && npm run lint` 全绿
  4. 手测覆盖四题型各至少一天（含周一松 / 周日紧抽样）+ 进行中存档重开不丢盘

**Plans:** 1/2 plans executed

Plans:
**Wave 1**

- [x] v2.4.2-03-01-PLAN.md — Marketing `2.4.2` + What's New disclosure + NONO-01 exact wording

**Wave 2** *(blocked on Wave 1 completion)*

- [x] v2.4.2-03-02-PLAN.md — Maestro four-type smoke + hand QA + CI + VERIFICATION sign-off

---

### Phase v2.6-02: Feel + Mechanics（手感+机制） — PAUSED

**Status:** **Paused** until v2.5 Adaptive ships（2026-07-28 renumber from v2.5-02）。  
**Goal**: 四种题型都具备可撤销的输入手感；数独可记会话内笔记；二进制/数绘支持拖填；数回边命中更可靠且不破坏角点判定；首遇题型有可跳过的操作演示；关键操作有触感反馈。  
**Depends on**: Phase v2.6-01；resume after v2.5-06  
**Requirements**: FEEL-01, FEEL-02, FEEL-03, FEEL-04, FEEL-05, FEEL-06  
**UI hint**: yes  
**Success Criteria**（用户可观察的行为）:

  1. 用户在四种题型的棋盘上都能撤销最近的编辑（会话内、有限步数；跨天或杀进程后不保留）
  2. 数独下用户可切换「记笔记」模式并填入候选数字，模式状态有清晰指示；退出会话后笔记不再保留（A1：仅本局会话）
  3. 用户在二进制/数绘棋盘上可连续拖动一笔填充多个格子，且整笔算作一次撤销记录
  4. 用户在数回上点击边线更容易命中，同时四角相邻边不会因热区扩大而误触（新增命中半径回归测试）
  5. 用户首次遇到某题型时会看到一个可跳过的操作演示（只讲怎么点/怎么拖，不讲怎么解——B：仅输入机制），跳过或看完后同题型不再重复出现
  6. 四种题型的关键操作（填格/撤销/边切换/冲突提示）都有恰当的触感反馈（`expo-haptics`）

**Plans (suggested waves)**:

- Wave 1: undo helper（`lib/undo/createUndoStack.ts`，先在数独验证）→ 接入四种题型棋盘
- Wave 2: 二进制/数绘拖填（`Gesture.Simultaneous` 与 `ScrollView` 协作）→ 数回边热区调优 + 角点回归测试
- Wave 3: 首次题型可跳过演示（四类各一次，B 边界签核）→ 数独笔记（本里程碑内最高风险项，排最后）→ 全量触感反馈收尾

---

### Phase v2.6-03: Signature（招牌时刻） — PAUSED / narrowed

**Status:** **Paused**；原 DIFF-01/DIFF-02 已吸收进 **v2.4.2**。恢复后仅交付 DIFF-03。原编号 v2.5-03。  
**Goal**: 择一题型落地「招牌时刻」微交互（~200ms 可识别反馈）。  
**Depends on**: Phase v2.6-02（招牌时刻需观察 Feel 落地效果后再选）  
**Requirements**: DIFF-03  
**UI hint**: yes  
**Success Criteria**（用户可观察的行为）:

  1. 用户在至少一种题型上能感受到一个约 200ms、有记忆点的反馈瞬间（招牌时刻），且该选择是在观察 Feel 阶段实际表现后再拍板
  2. 手测 checklist（`EXP-01` 延伸）覆盖「招牌时刻」验证项

**Plans (suggested waves)**:

- Wave 1: 招牌时刻择一落地（依据 Feel 阶段实际手感选定题型）

---

### Phase v3.0: 跨端，但慎入账号

**Goal**: 解决「换手机用户丢 streak」的痛点，但**坚决不引入自建账号 + 后端**。  
**Depends on**: v2.1 至少 4 周线上数据 + 客服反馈确认「跨端丢档」是真实头部问题  
**Status note (2026-07-14):** 相对 v2.4 **挂起** — 无丢档头部反馈前不做完整同步；若急需保险丝可仅提前 **v30-02** QR 导出/导入。  

**决策备忘（回应原 README v2 规划）：**

原 README v2 写「登录与跨设备同步」，但与定位冲突（无社交、离线优先、AGENTS.md 明列「Auth/backend 不在范围」）。三个替代方案优先级：

| 方案 | 复杂度 | 隐私风险 | 后端成本 | 推荐 |
|------|--------|----------|----------|------|
| A. iCloud / Google One 端到端同步 | 低 | 极低 | 0 | ★ 首选 |
| B. 导出/导入快照 QR 码 | 极低 | 0 | 0 | ★ Day-1 fallback |
| C. Apple/Google 一键登录 + 最小后端 | 中 | 中 | 月 $50+ | ⚠ 仅 A+B 失败后 |
| D. 自建账号体系 + 邮箱 | 高 | 高 | 月 $200+ | ✗ 永久砍掉 |

**Plans:**

- [ ] **v30-01**: iCloud / Android Auto Backup 端到端同步（仅 streak + stats + 完成历史，**不**同步当日盘面）
- [ ] **v30-02**: QR 码导出/导入快照（永远可用的 fallback）
- [ ] **v30-03**: 30 天历史归档（仅重温，**不计入 streak**，保护神圣性）

---

### Phase v4.0: 极克制的伙伴感

**Goal**: 满足「和朋友 yap 一下今天的题」需求，但绝不引入好友列表/IM/排行榜。  
**Depends on**: v2 + v3 数据均验证；社交需求在反馈/问卷中明确出现  

**Plans:**

- [ ] **v40-01**: 匿名挑战码（把今日 dateKey 通过短码发朋友 → 对方本地求解 → 互拷战报对比用时，**无服务器**）
- [ ] **v40-02**: Year in 傻了么（年终图鉴长图，复用月度图鉴管线）

---

## Progress

**Execution Order:** 1 → 2 → 3 → 4 → Nonogram → v1.1 → v1.2 → v2.0 ∥ v2.0-slitherlink → v2.1 → v2.2 → v2.3 → v2.4 → **v2.6-01 Composition** → **v2.4.2** → **v2.5 Adaptive (01→06)** → (resume) **v2.6-02 Feel** → **v2.6-03 DIFF-03** → (第五玩法 deferred) → v3.0 → v4.0

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| 1. 基础骨架 | 3/3 | Complete | 2026-05-16 |
| 2. 数独 | 2/2 | Complete | 2026-05-16 |
| 3. 二进制 | 2/2 | Complete | 2026-05-17 |
| 4. 结果体验 | 2/2 | Complete | 2026-05-16 |
| Nonogram | — | Complete | 2026-05-25 |
| **v1.1 留存基本盘** | 4/4 | Complete（代码） | 2026-05-31 核对 |
| **v1.2 国际化** | 2/2 | Complete（代码） | `1.2.0` |
| v2.0 Streak 升级 | 0/2 | Blocked by v1.1 线上 4 周数据 | — |
| **v2.0-slitherlink 数回** | 5/5 | Complete（代码） | 2026-06-01 |
| v2.0-closeout | 4/4 | Code complete · EAS pending | 2026-06-08 |
| **v2.1 内容深度** | 6/6 | **Shipped** App Store `2.1.0` | 2026-06-09 |
| **v2.2 温和成长** | 3/3 | **Shipped** App Store `2.2.0` | 2026-06-29 |
| **v2.3 同类更顺彩蛋** | 2/2 | **Shipped** App Store `2.3.0` | 2026-07 |
| **v2.4 周日特辑 + 数绘扩充** | 3/3 | **Shipped** App Store `2.4.0` | 2026-07-15 |
| **v2.6-01 Composition** | 2/2 | Complete（原 v2.5-01） | 2026-07-22 |
| **v2.4.2-01 Band Retune** | 2/2 | Complete | 2026-07-27 |
| **v2.4.2-02 Nonogram Expand** | 2/2 | Complete | 2026-07-27 |
| **v2.4.2-03 Ship 2.4.2** | 2/2 | Complete | 2026-07-28 |
| **v2.5-01 Mastery Foundation** | 2/2 | Complete | 2026-07-28 |
| **v2.5-02 Sudoku Rater** | 3/3 | Complete | 2026-07-28 |
| **v2.5-03 Binary + SL Raters** | 2/2 | Complete | 2026-07-29 |
| **v2.5-04 Nonogram Tiering** | 2/2 | Complete | 2026-07-29 |
| **v2.5-05 Dedupe + Wire** | 0/3 | Planned | — |
| **v2.5-06 Ship 2.5.0** | 0/? | Pending | — |
| **v2.6-02 Feel + Mechanics** | 0/? | **Paused** | — |
| **v2.6-03 Signature (DIFF-03)** | 0/? | **Paused** | — |
| 第五玩法（TYPE-01） | — | Deferred（需 ASC 证据） | — |
| v3.0 跨端 | 0/3 | Parked（待丢档反馈 / Android） | — |
| v4.0 伙伴感 | 0/2 | Conditional | — |

## 参考资料（决策依据）

- GameGrowthAdvisor: *Mobile Game Retention Guide 2026* — D1/D7/D30 by genre
- GameAnalytics × InvestGame: *2026 Mobile & PC Gaming Benchmarks*
- Snoopr: *Mobile App Retention Benchmarks 2026*
- AppDrift / AppMarketingPlus / Unstar.app: 2026 App Rating & Review 指南
- Lenny's Newsletter: *Behind the product: Duolingo Streaks*（Jackson Shuttleworth, PM 留存团队）
- Trophy: *Duolingo Gamification Case Study 2026*（streak freeze 数据）
- NYTCo Press: *Introducing Connections Stats and Streaks* / *Multi-Game Leaderboard*
- Growth Memo (Kevin Indig): *Wordle's growth loop*
- Tencent Push / Newly / Boundev / Reteno: *Push Notification 2026 Best Practices*
- CDA 数据分析师: 中国休闲游戏次日留存研究
- Affective: *What Emotional Triggers Make Users Rate Apps Positively*
