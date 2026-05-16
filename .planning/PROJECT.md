# 傻了么 (Silaomo)

## What This Is

一款极简的每日益智 App：用户每天打开后，系统自动在 **数独（Sudoku）** 与 **二进制谜题（Binary Puzzle / Takuzu / Binairo）** 中随机分配一局，玩完或放弃后看到搞笑鼓励/嘲讽文案，第二天自动换新题。无社交、无排行榜，专注「今天这一局」的体验。

## Core Value

用户每天只需打开 App，就能玩到**唯一、确定、不重复**的今日谜题，并在结束时获得情绪化的结果反馈——简单、有仪式感、明天再来。

## Requirements

### Validated

（尚无 — 待 MVP 上线验证）

### Active

- [ ] 每日自动随机选择 Sudoku 或 Binary Puzzle（用户不可自选类型）
- [ ] 同一天内谜题内容固定；跨日自动切换新游戏
- [ ] 数独与二进制谜题均可完整游玩（输入、校验、完成/放弃）
- [ ] 完成或放弃后进入结果页，展示随机搞笑文案与基础动画
- [ ] 本地持久化今日状态（是否已完成/放弃、日期、谜题种子）
- [ ] 纯客户端谜题生成与求解（无后端依赖）
- [ ] Expo + TypeScript 单代码库，支持 iOS / Android
- [ ] 游客模式可用（登录能力保留架构位，v1 不实现）

### Out of Scope

- 社交、好友、分享、排行榜 — 与极简定位冲突
- 用户自选今日游戏类型 — 核心规则为系统随机
- v1 完整登录/OAuth — 文档明确「保留但不开发」
- 后端谜题服务、多人对战 — MVP 零维护目标
- 复杂统计面板、成就系统 — 延后

## Context

- **目标用户**：喜欢轻量每日挑战、不需要重度游戏系统的休闲玩家
- **产品调性**：极简、略带毒舌/幽默的结果反馈（FunnyFeedback）
- **技术方向**：Expo + React Native + expo-router + NativeWind + Zustand（可选）+ AsyncStorage + 纯 JS 谜题算法
- **目录规划**：`app/` 路由、`components/Grid/`、`lib/puzzles/`、`hooks/useDailyGame.ts`
- **预估周期**：单人 2–4 周可玩 MVP

## Constraints

- **Tech stack**: Expo + TypeScript + expo-router + NativeWind — 一人可维护、热更新友好
- **Offline-first**: 谜题与进度均本地完成，无网络也能玩
- **Deterministic daily**: 同一自然日、同一设备得到相同「今日游戏」（基于日期种子）
- **Scope**: v1 仅两种谜题类型；扩展新游戏只需 `dailySelector` + 新 Grid 组件
- **Auth**: v1 游客优先；`expo-secure-store` / Supabase Auth 仅预留

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Expo + React Native (TypeScript) | 跨平台、单人快速迭代、EAS 热更新 | — Pending |
| expo-router 文件路由 | 页面少、结构清晰（index / game / result） | — Pending |
| NativeWind (Tailwind) | 与文档一致，样式快速、一致 | — Pending |
| 纯 JS 本地谜题生成 | 零后端、离线、可控难度 | — Pending |
| 每日系统随机游戏类型 | 产品核心规则，增加每日惊喜 | — Pending |
| Zustand 可选，MVP 可 Context | 状态简单，避免过度工程 | — Pending |
| 登录 v1 不开发 | 降低 MVP 范围，游客即可验证核心循环 | — Pending |
| react-native-reanimated 结果动画 | 完成/失败情绪反馈 | — Pending |

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
*Last updated: 2026-05-16 after initialization*
