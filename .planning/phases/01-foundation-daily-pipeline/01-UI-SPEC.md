---
phase: 1
slug: foundation-daily-pipeline
status: approved
shadcn_initialized: false
preset: none
design_source: ../../../DESIGN.md
created: 2026-05-16
updated: 2026-05-16
---

# Phase 1 — UI Design Contract

> 基础骨架与每日管道阶段的视觉与交互契约。  
> **设计系统唯一来源：[`DESIGN.md`](../../../DESIGN.md)**（xAI Inspired — 近黑画布、白描边胶囊、几何无衬线 + 等宽眉标）。  
> 技术栈：Expo SDK 54 + NativeWind v4（见 `01-CONTEXT.md` 与 `STACK.md`）。

---

## Design Source（必读）

| 文档 | 作用 |
|------|------|
| **`DESIGN.md`** | 颜色、字体阶梯、间距、圆角、按钮/卡片组件语义 — **冲突时以 DESIGN.md 为准** |
| 本文件 | Phase 1 屏幕布局、文案、NativeWind 映射、实现裁剪 |

**产品气质（摘自 DESIGN.md）：** 工程感、克制、无阴影；交互几乎全是 **描边胶囊**（`rounded.pill`）；展示标题 **字重一律 400**，靠字号与负字距分层。

**移动端字体替代（DESIGN.md § Note on Font Substitutes）：**

| DESIGN 角色 | RN 实现 |
|-------------|---------|
| universalSans | **Inter**（`@expo-google-fonts/inter`），Display 档加 `letterSpacing: -0.6` ~ `-1.2` |
| GeistMono | **Geist Mono** 或 **Space Mono**（`@expo-google-fonts/space-mono`），眉标全大写 + `letterSpacing: 1.2` |

---

## Design System

| Property | Value |
|----------|-------|
| Tool | **NativeWind v4** |
| Token 来源 | `DESIGN.md` → `tailwind.config.js` + `global.css` CSS 变量 |
| Component library | RN `Pressable` / `Text` / `View`；封装 `OutlinePillButton`、`HairlineCard`（对齐 DESIGN `button-outline-on-dark`、`card-content`） |
| Icon library | `@expo/vector-icons`（Ionicons，1px 线型，色 `{colors.ink}`） |

**Phase 1 裁剪：** 不用渐变英雄区、不用产品插画；`accent-sunset` 仅用于题型眉标或小点缀，不做大面积填充 CTA。

---

## Spacing Scale

与 `DESIGN.md` 对齐；**Phase 1 实现仅使用 4 的倍数**（避免 NativeWind 魔法数）：

| Token | DESIGN | Phase 1 实现 | Usage |
|-------|--------|----------------|-------|
| xs | 4px | 4px | 图标间隙 |
| sm | 8px | 8px | 胶囊按钮内边距（竖） |
| lg | 16px | 16px | 默认内边距 |
| xl | 24px | 24px | 卡片内边距、屏水平边距 |
| 2xl | 32px | 32px | 区块间距 |
| 3xl | 48px | 48px | 标题下留白 |
| 4xl | 64px | 64px | 首屏顶区偏移 |

**暂不实现：** `spacing.md`（12px）、`spacing.xxs`（2px）— 待全 App 统一时从 DESIGN 引入。

Exceptions: 无（本阶段）

---

## Typography

**原则（DESIGN.md）：** 全站 **weight 400**；禁止 Bold 做标题强调。

Phase 1 仅 4 档字号（映射 DESIGN token）：

| Role | DESIGN token | Size | Weight | Line Height | Letter spacing | Font |
|------|--------------|------|--------|-------------|----------------|------|
| Display | `display-sm` | 32px | 400 | 36px | -0.6px | Inter |
| Heading | `display-xs` | 20px | 400 | 28px | 0 | Inter |
| Body | `body-md` | 16px | 400 | 24px | 0 | Inter |
| Label | `body-sm` | 14px | 400 | 20px | 0 | Inter |

**眉标（额外样式，不增加字号档）：** `caption-mono` — 14px Geist Mono/Space Mono，**全大写**，`letterSpacing: 1.4px`，色 `ink`。用于「今日 · DATE」「PUZZLE TYPE」。

---

## Color

映射 `DESIGN.md` `colors.*`：

| Role | DESIGN key | Hex | Usage |
|------|------------|-----|-------|
| Dominant (60%) | `canvas` | `#0a0a0a` | 页面背景 `bg-canvas` |
| Secondary (30%) | `canvas-card` / `canvas-soft` | `#191919` / `#1a1c20` | 卡片、占位棋盘区 |
| Hairline | `hairline` | `#212327` | 边框、网格线、胶囊描边 |
| Text primary | `ink` | `#ffffff` | 标题、主文案 |
| Text secondary | `body` | `#dadbdf` | 正文说明 |
| Text muted | `body-mid` / `mute` | `#7d8187` | 日期、辅助说明 |
| Accent (10%) | `accent-sunset` | `#ff7a17` | 见下方 |
| Primary fill（极少） | `primary` + `on-primary` | `#ffffff` / `#0a0a0a` | 唯一白底胶囊（如「去玩今天的题」） |
| Destructive（语义扩展） | — | `#ff7a17` 或 `body-mid` 文案 | 放弃类操作用 **描边胶囊** + `body-mid` 字色，不用大面积红 |

**60/30/10：** `canvas` 铺满；`canvas-card` 承载内容块；暖橙 accent **仅**用于：

- 题型眉标（`caption-mono` 文字色或 1px 下划线）
- `ActivityIndicator` 加载指示（可选，默认用 `ink` 亦可）

**禁止：** 紫渐变、玻璃拟态、卡片阴影、把 accent 涂满按钮/背景。

**CSS 变量（实现时同步 DESIGN）：**
```css
--color-canvas: #0a0a0a;
--color-canvas-card: #191919;
--color-canvas-soft: #1a1c20;
--color-hairline: #212327;
--color-ink: #ffffff;
--color-body: #dadbdf;
--color-muted: #7d8187;
--color-accent-sunset: #ff7a17;
--color-primary: #ffffff;
--color-on-primary: #0a0a0a;
```

---

## Components（DESIGN → RN）

| DESIGN 组件 | Phase 1 用法 |
|-------------|----------------|
| `button-outline-on-dark` | 默认 CTA：**透明底 + 1px hairline 描边 + 白字 + `rounded-full`** |
| `button-primary` | 仅 **一个** 主路径：「去玩今天的题」白底黑字胶囊 |
| `card-content` | 占位棋盘外框：`bg-canvas-card` + `border-hairline` + `rounded-lg`（8px） |
| `eyebrow-mono` | 「今日 · 2026-05-16」「SUDOKU」类眉标 |
| `divider-hairline` | 区块分隔（可选） |

**按钮禁止：** 圆角矩形实心色块堆叠；禁止全局 filled 按钮。

**深度：** 无 shadow；仅 hairline border（DESIGN § Elevation）。

---

## Visual Hierarchy（Dimension 2）

| Screen | Focal point | 次要 | 三级 |
|--------|-------------|------|------|
| `index` | Display「傻了么」（Inter 32px 负字距） | `caption-mono`「DAILY PUZZLE」或中文眉标 | `ActivityIndicator`（ink） |
| `game`（占位） | Display 题型（数独 / 二进制） | `eyebrow-mono` 日期 | `card-content` 内虚线网格 |
| `result`（占位） | Heading 结束语 | Body `body` 色 | 描边胶囊「返回」 |

**背景：** 纯 `canvas` `#0a0a0a`；**不要**噪点纹理（与 DESIGN 扁平画布一致）。

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA（index → 今日局） | **去玩今天的题**（`button-primary` 白底胶囊） |
| Secondary CTA | **先看看题目**（`button-outline-on-dark`，占位可 disabled） |
| 放弃 | **今天不玩了**（outline 或 `body-mid` 文字按钮） |
| Hydrate | **正在翻出今天的傻题…** |
| 今日已结束 | 标题：**今天已经傻过了** · 正文：**明天再来，换一题折磨你。** |
| Error | **今日记录糊了** · **关掉 App 再开一次；还不行就明天再来。** |
| Destructive 确认（预留） | **放弃今日**：**确定放弃？明天会换一题，今天这道不保留进度。** |

---

## Screens — Phase 1

### `app/_layout.tsx`
- `StatusBar`：`light`
- 背景 `bg-canvas`；字体加载前同色闪屏（避免白屏）
- `SafeAreaProvider`；无 Tab Bar

### `app/index.tsx`

**A — Hydrating**
- 垂直居中：Display「傻了么」
- 可选眉标：`今日一题`（`caption-mono` 或中文 14px mono 风格）
- `ActivityIndicator` 色 `ink` 或 `accent-sunset`
- Body muted：「正在翻出今天的傻题…」

**B — Redirect** — 无 UI

**C — 今日已结束**
- `display-xs` 标题 + `body-md` 说明
- Outline 胶囊：**查看今天结果** → `/result`

### `app/game.tsx`（占位）

```
┌─────────────────────────────┐
│  EYEBROW  今日 · 2026-05-16  │  ← caption-mono, muted/ink
│                             │
│      Display  数独           │  ← display-sm, ink
│      accent 眉标 今日题型      │  ← 可选 sunset 字色
│                             │
│  ┌─────────────────────┐   │
│  │  card-content        │   │  ← #191919 + hairline
│  │  虚线占位 9×9         │   │
│  └─────────────────────┘   │
│  body-sm muted 棋盘下版本开放 │
│                             │
│  [button-primary] 先看看题目   │  ← disabled
│  [outline] 今天不玩了          │
└─────────────────────────────┘
```

- 水平边距 `xl`（24px）；禁止可玩格子

### `app/result.tsx`（占位）
- 居中：`display-xs` + `body-md`「明天见。」
- 无 Phase 4 动效；可用 `hairline` 细线分隔

### `app/(auth)/login.tsx`（占位）
- `body-sm` + `body-mid`：「登录以后再说」
- Outline 胶囊：**返回今日** → `/`

---

## Motion（Phase 1 最小）

| 时机 | 行为 |
|------|------|
| 路由进入 | 150–200ms opacity 淡入 |
| 按压胶囊 | `opacity: 0.85`（不用 scale 弹跳，保持 DESIGN 克制） |
| 庆祝/失败动效 | Phase 4 |

---

## Accessibility

- 触控区 ≥ **44×44pt**（胶囊通过 `padding` + `minHeight` 保证）
- `accessibilityLabel` 中文
- `ink` on `canvas` 对比度已满足
- 题型必须有文字，不单靠颜色

---

## Registry Safety

| Registry | Blocks | Safety Gate |
|----------|--------|-------------|
| shadcn | 无 | N/A |
| 第三方 registry | 无 | N/A |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS（accent 限定列表；对齐 DESIGN）
- [x] Dimension 4 Typography: PASS（4 档、全 400）
- [x] Dimension 5 Spacing: PASS（4px 倍数子集）
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-16（rev. 对齐 DESIGN.md）
