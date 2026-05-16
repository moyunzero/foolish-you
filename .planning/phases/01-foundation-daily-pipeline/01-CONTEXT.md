# Phase 1: 基础骨架与每日管道 - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

交付可运行的 Expo 应用骨架与「今日游戏」管道：本地 `dateKey`、确定性种子、`dailySelector`、AsyncStorage 持久化、`useDailyGame` 编排，以及 `index` / `game` / `result` 路由分流。`game` 屏可为占位（不要求本阶段可玩数独/二进制）。不包含真实谜题生成器与 Grid 玩法（Phase 2/3）。

</domain>

<decisions>
## Implementation Decisions

### Expo SDK 与开发方式
- **D-01:** 日常开发使用 **Expo Go**（扫码/局域网加载），不以 Development Build 作为默认工作流。
- **D-02:** 目标 **Expo SDK 54**，与商店版 Expo Go 支持的 SDK 对齐；依赖安装统一使用 `npx expo install`，避免手动指定与 SDK 不兼容的版本。
- **D-03:** 本阶段不引入 EAS Build / OTA 作为阻塞项；若计划需要，放在 MVP 可玩之后单独阶段。

### Claude's Discretion（本阶段未讨论，按项目默认执行）

以下在 discuss 中未展开，规划/实现时遵循 PROJECT.md 与 research，无需再问用户：

- **路由分流：** `index` 先 hydrate，再用 `<Redirect />`；`playing` → `/game`，`completed` | `abandoned` → `/result`（或首页展示「明天见」——Planner 选一种并写清 UX）。
- **今日日历：** 使用**设备本地自然日** `YYYY-MM-DD`（禁止 `toISOString().slice(0,10)` UTC 日期）。
- **Phase 1 game 占位：** 显示今日类型 + 日期 +「Phase 2 可玩」类占位即可，无需可交互谜题网格。
- **状态层：** MVP 优先 `useDailyGame` + React Context；仅当出现多屏共享状态痛点时再引入 Zustand persist。
- **登录：** `app/(auth)/login.tsx` 仅占位，默认游客从 `index` 进入核心流。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 项目与需求
- `.planning/PROJECT.md` — 产品边界、核心规则、技术约束
- `.planning/REQUIREMENTS.md` — DAILY-*、STOR-*、NAV-*、AUTH-*（Phase 1 映射）
- `.planning/ROADMAP.md` — Phase 1 目标与成功标准

### 调研（本阶段相关）
- `.planning/research/STACK.md` — SDK 54 vs 55、Expo Go vs Dev Build、NativeWind 安装
- `.planning/research/ARCHITECTURE.md` — 四层边界、目录树、`useDailyGame` 数据流
- `.planning/research/PITFALLS.md` — 时区、种子、AsyncStorage hydrate（Phase 1 必避）
- `.planning/research/SUMMARY.md` — 调研摘要

### 无外部 ADR/SPEC
- 无独立 ADR；实现决策以本文件 + 上述 `.planning/` 文档为准。

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 无 — 绿场项目，仓库当前仅有 `.planning/` 与 `CLAUDE.md`。

### Established Patterns
- 待 Phase 1 脚手架建立；遵循 ARCHITECTURE.md 中的 `lib/puzzles`（纯函数）与 `lib/storage` 分离。

### Integration Points
- 新建 `app/_layout.tsx` 为根；`index` → `game` / `result` 为 Phase 1 唯一导航集成点。
- `dailySelector` 在 Phase 1 可返回 stub puzzle payload，供 Phase 2/3 替换。

</code_context>

<specifics>
## Specific Ideas

- 用户原始架构目录：`app/`、`lib/puzzles/`、`hooks/useDailyGame.ts`、`components/Grid/`（Grid 本阶段可不实现）。
- 包/工程名可与仓库 `foolish-you` 并存；应用显示名「傻了么」。

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)
- 无匹配 todo。

None — discussion stayed within phase scope（仅讨论了 Expo SDK 选型）。

</deferred>

---

*Phase: 01-foundation-daily-pipeline*
*Context gathered: 2026-05-16*
