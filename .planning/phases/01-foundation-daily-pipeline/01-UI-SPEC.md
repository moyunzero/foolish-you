---
phase: 1
slug: foundation-daily-pipeline
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-16
---

# Phase 1 — UI Design Contract

> 基础骨架与每日管道阶段的视觉与交互契约。技术栈：Expo SDK 54 + NativeWind v4（见 CONTEXT D-01/D-02 与 STACK.md）。

---

## Design System

| Property | Value |
|----------|-------|
| Tool | **NativeWind v4**（Tailwind CSS 3.4） |
| Preset | 无 shadcn；自定义 token（`tailwind.config.js` + `global.css` CSS 变量） |
| Component library | 无 Radix；RN 原生 `Pressable` / `Text` / `View` + 本阶段少量封装 |
| Icon library | **@expo/vector-icons**（Ionicons，线型为主） |
| Font | **Fraunces**（Display）+ **DM Sans**（Body），经 `@expo-google-fonts/*` 加载 |

**设计方向（一句话）：** 深夜书桌上的每日一题——深色底、大字报式题型标题、克制动效，为 Phase 4 毒舌文案留舞台。

---

## Spacing Scale

Declared values（4px 网格）：

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | 图标与文字间距、徽章内边距 |
| sm | 8px | 紧凑控件间距 |
| md | 16px | 默认内边距、列表项间距 |
| lg | 24px | 卡片内边距、屏内区块间距 |
| xl | 32px | 主内容区水平边距（`px-8`） |
| 2xl | 48px | 标题与主内容之间 |
| 3xl | 64px | 屏顶安全区下首块内容偏移 |

Exceptions: 无

**NativeWind 映射：** 仅使用 `p-1/2/4/6/8/12/16` 与 `gap-*` 等等价 token，禁止魔法数 `13px`、`22px`。

---

## Typography

| Role | Size | Weight | Line Height | Font |
|------|------|--------|-------------|------|
| Body | 16px | 400 | 1.5 | DM Sans |
| Label | 14px | 500 | 1.4 | DM Sans |
| Heading | 20px | 600 | 1.3 | DM Sans |
| Display | 36px | 700 | 1.15 | Fraunces |

**层级规则：** 全 App 仅以上 4 档字号；禁止第五档。副标题用 Label + `text-muted` 色，不用更小字号。

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#141518` | 页面背景 `bg-background` |
| Secondary (30%) | `#1E2128` | 卡片、占位网格底 `bg-surface` |
| Accent (10%) | `#F2C94C` | 见下方「Accent reserved」 |
| Muted text | `#9AA3B2` | 次要说明、日期 |
| Border | `#2E3440` | 网格线、分隔 |
| Destructive | `#E85D5D` | 放弃、错误态（本阶段按钮可禁用但仍声明色值） |
| Success | `#6BCB77` | 完成态预留（Phase 1 result 占位可用淡提示） |

**60/30/10：** 背景占主导；`surface` 卡片与占位区为 Secondary；Accent 仅用于强调「今日」信息，不铺满界面。

**Accent reserved for（仅此）：**
- 今日题型徽章（「数独」「二进制」）描边或字色
- 主操作 CTA 背景（`index` 进入今日、`game` 占位屏唯一高亮按钮若启用）
- 焦点环 / 按下态 `pressed` 高亮（`opacity` 变化，不新增色相）

**禁止：** 把所有 `Pressable`、所有图标、所有标题都上 Accent。

**CSS 变量（`global.css`）：**
```css
--color-background: #141518;
--color-surface: #1E2128;
--color-accent: #F2C94C;
--color-foreground: #F5F5F0;
--color-muted: #9AA3B2;
--color-destructive: #E85D5D;
--color-success: #6BCB77;
--color-border: #2E3440;
```

---

## Visual Hierarchy（Dimension 2）

| Screen | Focal point（第一眼） | 次要 | 三级 |
|--------|----------------------|------|------|
| `index` | 居中品牌字标「傻了么」+ 加载指示 | 副标「今日一题」 | 无交互元素（hydrate 后 Redirect） |
| `game`（占位） | 大号题型 Display（「数独」/「二进制」） | 日期 Label | 虚线占位网格 |
| `result`（占位） | 「今天到此为止」Heading | 「明天见」Body | 返回/关闭次要按钮 |

**背景氛围：** 纯色底 + 可选 4% 噪点纹理（`ImageBackground` 或 CSS 重复噪点 PNG），禁止紫色渐变、禁止玻璃拟态 overload。

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA（index → 有今日局） | **去玩今天的题** |
| Primary CTA（game 占位，若展示） | **先看看题目**（禁用态副文案：即将在下一版可玩） |
| 放弃（game，占位可禁用） | **今天不玩了** |
| Empty / 首次安装 hydrate | **正在翻出今天的傻题…** |
| 今日已结束（index 或 result） | 标题：**今天已经傻过了** · 正文：**明天再来，换一题折磨你。** |
| Error（存储/加载失败） | **今日记录糊了** · **关掉 App 再开一次；还不行就明天再来。** |
| Destructive confirmation（预留） | **放弃今日**：**确定放弃？明天会换一题，今天这道不保留进度。** |

**禁止：** 「确定」「提交」「OK」「加载中…」（无说明）单独作为唯一文案。

---

## Screens — Phase 1

### `app/_layout.tsx`
- 深色状态栏（`light` content）
- 全屏 `bg-background`；加载字体前显示与 `index` 相同的纯色闪屏，避免白屏
- 可选：`SafeAreaProvider` 包裹；无底部 Tab

### `app/index.tsx`
**状态 A — Hydrating**
- 垂直居中：Display「傻了么」+ `ActivityIndicator`（accent 色）
- Label：「正在翻出今天的傻题…」

**状态 B — Redirect**
- 无 UI（立即 `<Redirect href="/game" />` 或 `/result`）

**状态 C — 今日已结束（若 Planner 选 index 而非 result）**
- Heading + Body（见 Copywriting）
- 次要文字按钮：**查看今天结果** → `/result`

### `app/game.tsx`（占位，非可玩）
```
┌─────────────────────────────┐
│  [Label] 今日 · 2026-05-16   │
│                             │
│     [Display] 数独           │  ← 或「二进制」
│     [Badge accent] 今日题型   │
│                             │
│   ┌─ ─ ─ ─ ─ ─ ─ ─ ┐       │
│   │  虚线占位 9×9   │       │  ← border-border，不可点击
│   └─ ─ ─ ─ ─ ─ ─ ┘       │
│   [Label muted] 棋盘下版本开放 │
│                             │
│  [Primary CTA] 先看看题目     │  ← disabled + opacity-50
│  [Text button] 今天不玩了     │  ← destructive 色，可 disabled
└─────────────────────────────┘
```
- 水平边距 `xl`（32px）；主内容 `2xl` 下间距
- 禁止本阶段实现可填格子

### `app/result.tsx`（占位）
- 居中：Heading「今天到此为止」+ Body「明天见。」
- 无 FunnyFeedback 动画（Phase 4）
- 可选弱 Success 色点缀（小圆点或细线，非大面积绿）

### `app/(auth)/login.tsx`（占位）
- 单行 Label：「登录以后再说」
- **返回今日** → `router.replace('/')`

---

## Motion（声明，Phase 1 最小实现）

| 时机 | 行为 | 实现 |
|------|------|------|
| index → game | 200ms 淡入 | `FadeIn` 或 opacity 动画 |
| 按压 CTA | scale 0.98 | `Pressable` + reanimated（已依赖，本阶段可 CSS opacity） |
| 庆祝/失败 | **不在 Phase 1 实现** | 留给 Phase 4 |

---

## Accessibility

- 所有可点击控件最小触控区 **44×44pt**
- 图标按钮必须带 `accessibilityLabel`（中文）
- 对比度：前景 `#F5F5F0` on `#141518` ≥ 4.5:1
- 色觉：题型除颜色外必须有文字（「数独」「二进制」）

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn | 无 | N/A — 未使用 shadcn |
| 第三方 UI registry | 无 | N/A |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-16
