# Requirements: 傻了么 (Silaomo)

**Defined:** 2026-05-16  
**Core Value:** 用户每天打开 App 就能玩到唯一、确定的今日谜题，并在结束时获得情绪化反馈。

## v1 Requirements

### Daily Game Loop

- [ ] **DAILY-01**: 用户打开 App 时，系统根据当前本地日历日自动决定今日游戏类型（Sudoku 或 Binary Puzzle），用户不能手动选择类型
- [ ] **DAILY-02**: 同一自然日内，同一设备上的今日谜题内容固定（基于日期种子可复现）
- [ ] **DAILY-03**: 跨自然日（本地时区）后，自动视为新一天并生成新的今日游戏
- [ ] **DAILY-04**: 若用户今日已完成或已放弃，再次打开 App 时进入结果态或「明天见」引导，而非重新开局
- [ ] **DAILY-05**: 今日游戏类型或同类型谜题与前一自然日不同（避免连续两天完全相同体验）

### Sudoku

- [ ] **SUDO-01**: 用户可在标准 9×9 数独网格中填入/擦除数字 1–9
- [ ] **SUDO-02**: 系统校验同行、同列、同宫冲突并给出即时反馈
- [ ] **SUDO-03**: 用户可主动「完成」或「放弃」本局
- [ ] **SUDO-04**: 全部空格合法填满时判定为成功完成

### Binary Puzzle

- [ ] **BIN-01**: 用户可在 Binary Puzzle 网格中切换单元格为 0/1（或等效二元状态）
- [ ] **BIN-02**: 系统强制执行 Takuzu/Binairo 规则（行/列 0/1 数量平衡、禁止三连、行列唯一性等，按选定规格）
- [ ] **BIN-03**: 用户可主动「完成」或「放弃」本局
- [ ] **BIN-04**: 全部单元格填满且满足规则时判定为成功完成

### Result & Feedback

- [ ] **RSLT-01**: 完成或放弃后导航至结果页
- [ ] **RSLT-02**: 结果页根据成功/失败展示随机搞笑鼓励或嘲讽文案（FunnyFeedback）
- [ ] **RSLT-03**: 结果页包含基础庆祝或失败动画（reanimated）

### Persistence & Offline

- [ ] **STOR-01**: 使用 AsyncStorage（或等价封装）持久化：今日日期键、游戏类型、谜题种子/状态、完成或放弃标记
- [ ] **STOR-02**: 无网络连接时，用户仍可获取并游玩今日谜题
- [ ] **STOR-03**: 谜题在设备本地生成，不依赖远程 API

### Navigation & Shell

- [ ] **NAV-01**: 使用 expo-router 实现 index（入口）、game（今日游戏）、result（结果）路由
- [ ] **NAV-02**: App 启动流程：检查今日状态 → 未完成则进 game → 已结束则进 result 或首页提示

### Guest / Auth (v1)

- [ ] **AUTH-01**: v1 以游客模式可完整体验核心循环（无需登录）
- [ ] **AUTH-02**: 代码结构预留 login 路由与 secure-store token 位，但 v1 不实现真实登录 UI/流程

### Optional MVP Enhancements (in-scope if time)

- [ ] **GAME-01**: 本局计时显示（开始至完成/放弃）
- [ ] **GAME-02**: 有限次数提示（数独或 Binary 至少一种）

## v2 Requirements

### Authentication

- **AUTH-10**: 用户可通过 expo-auth-session 或 Supabase Auth 登录
- **AUTH-11**: 登录态跨设备同步今日进度（需后端）

### Notifications

- **NOTF-01**: 每日本地推送提醒用户回来玩（expo-notifications）
- **NOTF-02**: 用户可开关提醒时间

### Polish

- **POL-01**: 简单历史记录（近 7 天完成/放弃）
- **POL-02**: 无障碍增强（VoiceOver 标签、对比度）

## Out of Scope

| Feature | Reason |
|---------|--------|
| 社交、好友、分享 | 产品定位为极简每日一局 |
| 排行榜、竞技 | 同上 |
| 用户自选今日谜题类型 | 违反核心随机规则 |
| v1 完整账号体系 | 文档明确登录保留但不开发 |
| 后端谜题服务 | MVP 零维护、离线优先 |
| 第三种谜题类型 | v1 仅 Sudoku + Binary |
| 应用内购买、广告 | 未在 MVP 目标内 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| (populated by roadmap) | | |

**Coverage:**
- v1 requirements: 24 total (22 core + 2 optional)
- Mapped to phases: pending roadmap
- Unmapped: pending

---
*Requirements defined: 2026-05-16*
*Last updated: 2026-05-16 after initial definition*
