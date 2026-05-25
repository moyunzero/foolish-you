# 傻了么 (Silaomo)

一款极简的**每日益智**移动应用：每天打开，系统会在 **数独**、**8×8 二进制谜题（Takuzu / Binairo）** 与 **8×8 数绘（Nonogram / Picross）** 中随机分配一局。玩完或认怂后，用带点毒舌的文案收尾；第二天 0 点自动换新题。

无社交、无排行榜、无填格提示——专注「今天这一局」。

**给 AI / 协作者：** 实现规范见仓库根目录 [`AGENTS.md`](./AGENTS.md)；GSD 工作流见 [`CLAUDE.md`](./CLAUDE.md)。

---

## 功能概览

| 能力 | 说明 |
|------|------|
| 每日一题 | 按本地自然日 + 种子确定题型与盘面，同一天多次打开内容一致 |
| 数独 | 9×9 标准数独，冲突高亮，完成 / 认怂 |
| 二进制谜题 | 8×8，每行每列各 4 个 0 与 4 个 1，禁止三连、行列不重复 |
| 数绘 | 8×8 Nonogram，行列提示填格，完成后校验，结果页揭示图案 |
| 离线优先 | 谜题在设备端生成与校验，无需联网 |
| 进度持久化 | AsyncStorage 保存今日状态，杀进程后可续玩 |
| 结果页 | 随机搞笑文案 + Reanimated 入场动效、「明天再来」提示 |
| 本局计时 | 游戏页显示 `MM:SS` 用时 |
| 规则说明 | 游戏页标题旁 `?` 弹窗查看玩法 |

**v1 不包含：** 登录账号、推送提醒、提示功能、分享与排行榜（见 [路线图](#版本与规划)）。

---

## 技术栈

- [Expo SDK 54](https://docs.expo.dev/) + [expo-router](https://docs.expo.dev/router/introduction/)（文件路由）
- React Native 0.81 · React 19 · TypeScript
- [NativeWind v4](https://www.nativewind.dev/)（Tailwind CSS）
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)（结果页动效）
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)（本地存储）
- 谜题逻辑：纯 TypeScript（`lib/puzzles/`），含生成器、求解器与校验

支持 **iOS**、**Android**（托管工作流，未提交 `ios/` / `android/` 原生目录）。

---

## 环境要求

- **Node.js** 20 LTS 或更高（推荐 20.x）
- **npm** 10+（本项目以 `package-lock.json` 为准）
- **iOS**：Xcode + 模拟器（仅 macOS），或 [Expo Go](https://expo.dev/go)
- **Android**：Android Studio 模拟器，或真机 + Expo Go

---

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/moyunzero/foolish-you.git
cd foolish-you

# 安装依赖
npm install

# 启动开发服务器
npm start
```

在终端按 `i` 打开 iOS 模拟器，按 `a` 打开 Android 模拟器，或扫码用 **Expo Go** 连接。

若修改过 `babel.config.js`（如 Reanimated 插件）或原生依赖，请清缓存后启动：

```bash
npx expo start -c
```

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Expo 开发服务器 |
| `npm run ios` | 在 iOS 模拟器/设备上运行（需预构建或 dev client） |
| `npm run android` | 在 Android 上运行 |
| `npm run web` | Web 预览（非主要目标平台） |
| `npm test` | 运行 Jest 单元 + RTL 测试（谜题、存储、Context、屏幕） |

---

## 项目结构

```
foolish-you/
├── app/                    # expo-router 页面
│   ├── index.tsx           # 入口：根据今日状态跳转 game / result
│   ├── game.tsx            # 游戏主界面（数独 / 二进制 / 数绘分支）
│   ├── result.tsx          # 完成 / 认怂结果页（数绘含图案揭示卡）
│   └── (auth)/login.tsx    # 登录占位（v1 未实现）
├── components/
│   ├── grid/               # SudokuGrid、BinaryGrid、NonogramGrid、数字键盘
│   ├── game/               # GameScreenHeader/Footer、各题型 Section、规则弹窗
│   └── result/             # 结果页徽章、数绘揭示卡与动效区块
├── contexts/
│   └── DailyGameContext.tsx  # 今日谜题状态、持久化、完成/放弃
├── hooks/
│   └── useElapsedTimer.ts  # 本局计时
├── lib/
│   ├── date/               # 本地自然日 dateKey
│   ├── puzzles/            # 数独、二进制、数绘、每日选题、RNG
│   ├── storage/            # AsyncStorage 读写
│   └── copy/               # 文案（结果页、规则）
├── constants/              # 配置、设计 token、开发开关
├── assets/                 # 图标与启动图
└── __tests__/              # Jest 测试
```

### 核心流程

1. **启动** → `DailyGameContext` 读取或创建「今日档案」（`dateKey` + `seed` + `gameType` + 盘面）。
2. **选题** → `lib/puzzles/dailySelector.ts` 根据日期种子在数独 / 二进制 / 数绘间稳定随机，并生成可解盘面。
3. **游玩** → `app/game.tsx` 根据 `gameType` 渲染对应网格与底栏；进度防抖写入本地。
4. **结束** → 完成或认怂 → `app/result.tsx` 展示文案与动效；次日 `dateKey` 变化后自动新局。

---

## 开发调试

开发模式下（`__DEV__`）可在首页使用 **开发者面板**（重开今日、强制题型等），配置见 `constants/dev.ts`。

```ts
// constants/dev.ts
export const DEV_FORCE_GAME_TYPE: GameType | null = 'sudoku'; // null = 与线上一致随机；可选 'binary' | 'nonogram'
```

正式 Release 构建不会包含该面板。

---

## 测试

```bash
npm test
```

当前覆盖：日期工具、RNG、每日选题、数独/二进制/数绘生成与校验、本地存储与连签、Context 与主要屏幕 RTL（205 项）。UI 动效与真机布局以手测为主。

---

## 构建与发布（概要）

使用 [EAS Build](https://docs.expo.dev/build/introduction/) 或本地预构建：

```bash
# 需先安装 eas-cli 并登录 Expo 账号
npx eas build --platform ios
npx eas build --platform android
```

`app.json` 中已配置应用名 **傻了么**、Bundle ID `com.moyunzero.foolish-you`、深色界面。发布前请自行替换图标、签名与商店元数据。

---

## 版本与规划

| 版本 | 范围 |
|------|------|
| **v1.0（当前）** | 每日数独 / 二进制 / 数绘、本地进度、连签、结果动效、计时、规则弹窗 |
| **v2（规划）** | 登录与跨设备同步、本地推送提醒、历史记录等 |

内部规划文档位于 `.planning/`（已加入 `.gitignore`，不随仓库公开）。

---

## 设计说明

视觉与交互约定见本地 `DESIGN.md`（已加入 `.gitignore`，不随 GitHub 公开）。

---

## 许可证

尚未指定开源许可证。若你 fork 或二次发布，请先与仓库维护者确认授权。

---

## 致谢

谜题算法与产品灵感来自经典数独与 Takuzu/Binairo 规则；由 Expo 与 React Native 生态驱动交付。

## 徽章

![version](https://img.shields.io/badge/version-1.0.0-blue)

## 使用示例

### 玩家：完成今日一局

1. 启动 App → `app/index.tsx` 根据今日档案跳转到 `app/game.tsx`。
2. 游戏页顶栏 `GameScreenHeader` 显示日期、本局用时、题型标题，以及连签副文案（来自 `DailyGameContext` 的 `streakLine`）。
3. 填完盘面后点底栏 **完成今日**（`GameScreenFooter`）→ 校验通过则进入结果页；**认怂**不计入连签。
4. 次日本地 `dateKey` 变更后自动换新题。

### 连签（通关入账）

- **仅通关计入连签**，认怂不调用 `applyCheckIn`（见 `contexts/DailyGameContext.tsx`）。
- 逻辑：`lib/streak/streakLogic.ts`（连续自然日 +1，断档归零）；持久化：`lib/storage/streakStorage.ts`（键 `@foolish-you/streak-v1`）。
- 文案：`lib/copy/streak.ts` 的 `formatStreakLine()`；今日已入账时顶栏连签高亮（`streakHighlight`）。

### 开发者：提交前本地检查（与 CI 一致）

GitHub Actions 工作流 `.github/workflows/ci.yml` 在 `main` / `master` 的 push 与 PR 上执行：

```bash
npm run typecheck   # tsc --noEmit
npm test            # Jest：unit（*.test.ts）+ rtl（*.test.tsx）
npm run lint        # expo lint
```

可选拆分：

```bash
npm run test:unit   # 谜题、存储、连签等纯逻辑
npm run test:rtl    # Context 与屏幕级 RTL 测试
```

## 文档

| 文档 | 说明 |
|------|------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 架构、数据流、离线优先与持久化 |
| [docs/GETTING-STARTED.md](./docs/GETTING-STARTED.md) | 安装与首次运行 |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | 日常开发、CI 校验、DevTools |
| [docs/TESTING.md](./docs/TESTING.md) | Jest 双项目与手测清单 |
| [docs/CONFIGURATION.md](./docs/CONFIGURATION.md) | app.json、EAS、常量与存储键 |
