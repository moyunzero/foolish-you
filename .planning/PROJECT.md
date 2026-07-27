# 傻了么 (Silaomo) / Brainfool

## What This Is

一款极简的每日益智 App：用户每天打开后，系统自动在 **数独（Sudoku）**、**二进制谜题（Binary Puzzle / Takuzu / Binairo）**、**数绘（Nonogram / Picross）** 与 **数回（Slitherlink）** 中随机分配一局，玩完或放弃后看到搞笑鼓励/嘲讽文案，并可拷贝 emoji 战报；第二天自动换新题。无社交、无排行榜，专注「今天这一局」的体验。品牌人格是**毒舌主持人**：开场有旁白、结局有金句，认怂是节目高潮而非羞于出口。

**当前版本：** 营销 `2.4.1`（Expo SDK 54；**iOS App Store 已上架** `2.4.0`；Android Google Play 未发布）

## Core Value

用户每天只需打开 App，就能玩到**唯一、确定、不重复**的今日谜题，并在结束时获得情绪化的结果反馈——简单、有仪式感、明天再来。

## Current Milestone: v2.4.2 Content Depth（题量 + 难度）

**Goal:** 在不动手感/UI 的前提下，拉开四种题型的周节奏难度，并扩充可感知的题目变化（尤其数绘图案库）；发版披露跨版本变盘。

**Target features:**
- **数独 / 二进制**：拉宽周节奏 givens（周一更松、周日更紧），保持唯一解与确定性
- **数绘**：append-only 扩充图案库（90→约 120，各 tier 大致均衡）+ zh/en 标题
- **数回**：拉宽 easy/medium/hard 参数带；必要时加强生成多样性 / builtin 兜底
- **发版**：营销版本 `2.4.2`；说明中披露未玩过日期盘面可能变化；进行中存档有回归保护

**Locked decisions (2026-07-26):**
- 独立内容补丁（1A）；**暂停** v2.5-02 手感（Undo/笔记等）
- 吸收原 v2.5-03 的 DIFF-01/DIFF-02（难度加深 + 变盘披露）；招牌微交互（DIFF-03）仍留在 v2.5 恢复后
- 不改 `APP_SALT`、不改选题逻辑、不加第五玩法、不做 UI 难度标签
- 接受跨版本变盘 + 发版说明披露（同 v2.5 锁定 C）

**Paused (resume after 2.4.2 ships):**
- v2.5 Host-Crafted Play 剩余：FEEL-01..06、DIFF-03（v2.5-01 Composition 已完成）

## Requirements
- Validated in Phase v2.4.2-01: BAND-01/02/03 + SHIP-02 unit lock (2026-07-27)


### Validated

- [x] 每日自动随机选择 Sudoku / Binary / Nonogram / Slitherlink（用户不可自选类型）
- [x] 同一天内谜题内容固定；跨日自动切换新游戏
- [x] 四种谜题均可完整游玩（输入、校验、完成/放弃）
- [x] **v2.0-slitherlink** 7×7 数回：polyomino 环生成、边三态 UI、冲突反馈、结果 Reveal、战报（无 solution 泄漏）
- [x] 完成或放弃后进入结果页，搞笑文案 + Reanimated 动效 + 本局计时
- [x] 本地持久化今日状态（日期、种子、进度、完成/放弃）
- [x] 纯客户端谜题生成与求解（无后端）
- [x] Expo + TypeScript，iOS / Android
- [x] 游客模式（登录占位，v1 未实现）
- [x] **v1.1** emoji 战报剪贴板、结果三数据卡、评分引导、防御性选题/快照恢复
- [x] **v1.2** 系统语言 zh/en、Brainfool 品牌、双语隐私、Dev 语言预览
- [x] **v2.0-streak** 连签护盾（每周 1 张、上限 2）、昨日错过召回
- [x] **v2.1** 周节奏难度、本月月历 + 摘要、每日提醒 A+D、月度图鉴 PNG
- [x] **v2.2** 温和成长：结果页近况行 + 月历成长摘要（永不负反馈）
- [x] **v2.3** 同类更顺彩蛋：同玩法明显更快时结果页正向单行（无 storage bump）
- [x] **v2.4** 周日特辑（仪式感问候 + 周日结果文案）+ 数绘图案库扩充；App Store `2.4.0` 2026-07-15
- [x] **v2.5-01** Composition：游戏页/结果页舞台化（代码已合入；UAT 可后续补）

### Active

- [ ] **v2.4.2 Content Depth** — 四题型难度带 + 数绘扩库 + 变盘披露；见 Current Milestone
- [ ] **v2.5 Host-Crafted Play（剩余）** — FEEL + DIFF-03；2.4.2 发版后恢复
- [ ] **第五玩法** — 挂起至 ASC 证明新鲜感衰减
- [ ] **v3.0** 跨端 / QR — 挂起；无丢档头部反馈前不做完整同步

### Out of Scope

- 社交好友、IM、排行榜 — 与极简定位冲突（**剪贴板战报 ≠ 社交 feed**）
- 用户自选今日游戏类型 — 核心规则为系统随机
- 全球同题 / 全服强制同题型 — 锁定绝对个人盘面
- v1 完整登录/OAuth — 占位 only
- 后端谜题服务、多人对战 — 离线优先
- 填格提示（hint）— 与「认怂」机制冲突
- 正式版应用内语言设置 — v1.2 仅跟随设备 locale；Dev 可预览
- IAP / 广告 — 品牌与体验约束
- Undo / 数独笔记 / 拖填 / 首遇引导 / 招牌微交互 — 本里程碑不做（属暂停中的 v2.5）
- 第五玩法 — 非本补丁范围
- Google Play 首发 / ASO 大改 — 非本里程碑主线

## Context

- **目标用户**：喜欢轻量每日挑战、不需要重度游戏系统的休闲玩家
- **产品调性**：极简 + **毒舌主持人**人格（开场旁白、结果金句、认怂喜剧）
- **技术方向**：Expo + React Native + expo-router + NativeWind + AsyncStorage + 纯 TS 谜题引擎
- **目录**：`app/` 路由、`components/grid/`、`lib/puzzles/`、`contexts/DailyGameContext.tsx`
- **状态**：营销 `2.4.1`；当前里程碑 **v2.4.2 Content Depth**；v2.5-01 已合入，v2.5-02+ 暂停

## Constraints

- **Tech stack**: Expo SDK 54 + TypeScript + expo-router + NativeWind
- **Offline-first**: 谜题与进度均本地完成
- **Deterministic daily**: 同一自然日、同一设备 → 相同 seed / 题型 / 盘面（勿随意改 `APP_SALT` / 选题逻辑；难度/生成参数变更须在发版说明中声明跨版本变盘）
- **Scope**: 四种谜题（数独 / 二进制 / 数绘 / 7×7 数回）；扩展新游戏 → `dailySelectorSafe` + 新玩法 UI
- **Auth**: 游客优先；Secure Store / Supabase 仅预留
- **i18n**: release 仅设备 locale（zh / en）；文案在 `locales/`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Expo + React Native (TypeScript) | 跨平台、单人迭代、EAS | **Done** |
| expo-router 文件路由 | 页面少、结构清晰 | **Done** |
| NativeWind (Tailwind) | 样式一致、快速 | **Done** |
| 纯 JS 本地谜题生成 | 零后端、离线 | **Done** |
| 每日系统随机游戏类型 | 产品核心规则 | **Done** |
| Context（DailyGameContext） | 状态简单，无 Redux | **Done** |
| 登录 v1 不开发 | 降低 MVP 范围 | **Done** |
| react-native-reanimated 结果动画 | 情绪反馈 | **Done** |
| 无 hint | 用户否决 GAME-02 | **Done** |
| emoji 战报剪贴板（v1.1） | Wordle 式增长环 | **Done** |
| StoreReview 门槛 + cooldown（v1.1） | 控差评、不打扰 | **Done** |
| 设备 locale only（v1.2） | 一人维护、无设置页 | **Done** |
| 绝对个人盘面 | 用户锁定；不做全球同题 | **Active** |
| 品牌 = 毒舌主持人 | 人格进布局与节奏 | **Active** |
| v2.4.2 = 内容补丁优先于 v2.5 手感 | 先拉难度/题量，手感后置 | **Active** |
| 调难度 = 披露跨版本变盘 | 同 v2.5 锁定 C | **Active** |

## Evolution

本文件在阶段切换与里程碑完成时更新。

**阶段切换后：**
1. 失效需求 → 移入 Out of Scope 并注明原因
2. 已验证需求 → 移入 Validated
3. 新需求 → 加入 Active
4. 新决策 → 记入 Key Decisions
5. 「What This Is」是否仍准确 → 漂移则更新

**里程碑完成后：**
1. 全文复审
2. Core Value 是否仍正确
3. Out of Scope 理由是否仍成立
4. Context 更新现状（反馈、指标）

---
*Last updated: 2026-07-27
