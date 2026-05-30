# 傻了么 (Brainfool)

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
| 本局计时 | 游戏页显示 `MM:SS` 用时；前后台切换与系统时间校正（防计时回跳） |
| 规则说明 | 游戏页标题旁 `?` 弹窗查看玩法 |
| **v1.1** emoji 战报 | 结果页「拷贝战报」：emoji 网格 + 用时/连签，写入剪贴板（`expo-clipboard`） |
| **v1.1** 结果统计卡 | 今日用时、本周完成天数、历史最长连签（三列小卡） |
| **v1.1** 评分引导 | 通关后按门槛延迟唤起系统应用商店评分（`expo-store-review`，可关闭、不阻塞流程） |
| **v1.1** 防御性保障 | 每日选题可解性校验 + 内置 fallback；快照损坏修复；`completed` 与残缺棋盘矛盾时剥离 `playState` |
| **v1.2** 系统语言 | 跟随设备 `zh` / `en`（英文品牌 **Brainfool**）；双语隐私政策；**无**正式版应用内语言设置 |

**仍不包含：** 登录账号、推送提醒、填格提示、社交/排行榜/好友（见 [路线图](#版本与规划)）。

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

- **Node.js** 22 LTS（与 CI 一致；仓库根目录 `.nvmrc` 为 `22`）
- **npm** 11+（与 CI 一致；本项目以 `package-lock.json` 为准，请用 `npm ci` 安装）
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
| `npm run test:migration` | 仅跑存储迁移黄金样例（与 CI 一致） |
| `npm run typecheck` | TypeScript 严格检查（`tsc --noEmit`） |
| `npm run lint` | ESLint（`expo lint`） |

---

## 项目结构

```
foolish-you/
├── app/                    # expo-router 页面
│   ├── index.tsx           # 入口：根据今日状态跳转 game / result
│   ├── game.tsx            # 游戏主界面（数独 / 二进制 / 数绘分支）
│   ├── result.tsx          # 完成 / 认怂结果页（数绘含图案揭示卡）
│   ├── privacy.tsx         # 应用内隐私政策
│   ├── settings.tsx        # 设置占位（仅 __DEV__，Release 重定向首页）
│   └── (auth)/login.tsx    # 登录占位（v1 未实现）
├── components/
│   ├── grid/               # SudokuGrid、BinaryGrid、NonogramGrid、数字键盘
│   ├── game/               # GameScreenHeader/Footer、各题型 Section、规则弹窗
│   └── result/             # 结果页徽章、统计卡、战报按钮、数绘揭示卡与动效
├── contexts/
│   └── DailyGameContext.tsx  # 今日谜题状态、持久化、完成/放弃
├── hooks/
│   └── useElapsedTimer.ts  # 本局计时（含 AppState / 时钟校正）
├── lib/
│   ├── date/               # 本地自然日 dateKey、日期运算
│   ├── puzzles/            # 数独、二进制、数绘、每日选题、可解性、RNG
│   ├── storage/            # AsyncStorage、迁移、恢复、完成历史、评分状态
│   ├── share/              # emoji 战报拼装
│   ├── stats/              # 结果页统计卡
│   ├── rating/             # 应用商店评分门槛与唤起
│   ├── time/               # 用时格式化与 elapsed 计算
│   ├── i18n/               # 设备语言解析、useI18n、格式化
│   └── copy/               # 文案入口（池子来自 locales/）
├── locales/                # zh / en 文案与 UI 字符串
├── constants/              # 配置、设计 token、开发开关
├── assets/                 # 图标与启动图
└── __tests__/              # Jest 测试
```

### 核心流程

1. **启动** → `DailyGameContext` 读取或创建「今日档案」（`dateKey` + `seed` + `gameType` + 盘面）。
2. **选题** → `lib/puzzles/dailySelectorSafe.ts`（可解性校验 + 必要时 fallback）根据日期种子在数独 / 二进制 / 数绘间稳定随机，并生成可解盘面。
3. **游玩** → `app/game.tsx` 根据 `gameType` 渲染对应网格与底栏；进度防抖写入本地。
4. **结束** → 完成或认怂 → `app/result.tsx` 展示文案与动效；次日 `dateKey` 变化后自动新局。

---

## 开发调试

开发模式下（`__DEV__`）可在首页使用 **开发者面板**（重开今日、强制题型、**设置占位**预览语言等），配置见 `constants/dev.ts`。

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

当前覆盖：日期工具、RNG、每日选题与 safe 选题、数独/二进制/数绘生成与校验、存储迁移/恢复、完成历史、战报与统计、评分门槛、连签、i18n（含 `en-smoke`）、Context 与主要屏幕 RTL（**298** 项）。另含 `npm run test:migration` 迁移黄金样例。UI 动效与真机布局以手测为主。

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

> 详见内部 `.planning/ROADMAP.md`。

### 设计宪法（红线 · 不可破）

- **离线优先**：`dateKey + seed` 决定盘面，永不远程下发
- **一天一局**：不变成「每日 3 题」，今天的张力来自唯一性
- **不做**：排行榜、好友、IM、IAP、广告、提示按钮、可堆叠超过 2 的护盾
- **毒舌幽默**是品牌护城河，所有文案都要过这一关

### 北极星与节奏

| 阶段 | D1 | D7 | D30 | 评分 | 完成 → 分享率 |
|------|----|----|-----|------|----------------|
| v1.0（已上架基线） | — | — | — | 已公测 | 0%（无入口） |
| **当前 v1.1（本仓库）** | 待观测 | 待观测 | 待观测 | 目标 ≥ 4.4 | 目标 ≥ 3%（战报拷贝） |
| v1.1 上线后 ≈ 3 月 | 32% | 12% | 5% | ≥ 4.4 | ≥ 3% |
| v2.0 后 ≈ 6 月 | **35%+** | **15%+** | **7%+** | **≥ 4.5** | ≥ 5% |
| 12 月目标 | 38% | 18% | 9% | 4.6 | 7% |

> 目标是把「傻了么」从 Puzzle 子类中位推进到 Top 25%（行业 35/15/5 基准）。

### 版本路线

| 版本 | 状态 | 范围 | 关键押注（数据锚点） |
|------|------|------|------------------------|
| **v1.0** | 已发布 | 每日数独 / 二进制 / 数绘、本地进度、连签、结果动效、计时、规则弹窗 | — |
| **v1.1** | 已发布（`1.1.x`） | ① 结果页 emoji 战报拷贝（`lib/share/` + `expo-clipboard`）；② 评分引导（通关 + 完成局数等门槛，`expo-store-review`）；③ 结果页三数据小卡（今日用时 / 本周完成 / 历史最长连签，`historicalMax`）；④ 防御：`selectDailyGameSafe`、快照 `recoverSnapshot`、计时校正、迁移 + recovery 单测、Dev 恢复日志 | Wordle 90→300K DAU 来自一键 emoji 分享 |
| **v1.2** | **当前（`1.2.0`）** | 系统语言 zh/en（`expo-localization`）；英文品牌 **Brainfool**；`locales/` + `useI18n`；双语隐私；DevTools **设置占位**（不写存储，Release 无入口） | 海外可读性 + 商店合规 |
| **v2.0** | 规划中 | Streak Freeze（每周 1 张、最多堆 2）；每日提醒；个人统计页；「昨日错过」召回 | Duolingo：streak 寿命 +48%；7 天 streak 用户次日留存 2.4× |
| **v2.1** | 规划中 | 周节奏难度（仍每天 1 局）；本月日历；月度数绘图鉴长图 | NYT Mini/Midi 节奏 |
| **v3.0** | 规划中 | iCloud / Google 端到端同步或 QR 导入导出；30 天历史归档 | 避免与「离线优先 / 无社交」冲突 |
| **v4.0** | 规划中 | 匿名挑战码；Year in 傻了么 年终长图 | 朋友间话题，无好友列表 |

完整决策依据、AB 实验设计与对照取舍见 `.planning/ROADMAP.md`（已加入 `.gitignore`，不随仓库公开）。

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

![version](https://img.shields.io/badge/version-1.2.0-blue)

## 使用示例

### 玩家：完成今日一局

1. 启动 App → `app/index.tsx` 根据今日档案跳转到 `app/game.tsx`。
2. 游戏页顶栏 `GameScreenHeader` 显示日期、本局用时、题型标题，以及连签副文案（来自 `DailyGameContext` 的 `streakLine`）。
3. 填完盘面后点底栏 **完成今日**（`GameScreenFooter`）→ 校验通过则进入结果页；**认怂**不计入连签。
4. 结果页可点 **拷贝战报**（需保留有效 `playState`；恢复后若棋盘已剥离则仅展示文案与统计）。
5. 次日本地 `dateKey` 变更后自动换新题。

### 连签（通关入账）

- **仅通关计入连签**，认怂不调用 `applyCheckIn`（见 `contexts/DailyGameContext.tsx`）。
- 逻辑：`lib/streak/streakLogic.ts`（连续自然日 +1，断档归零）；持久化：`lib/storage/streakStorage.ts`（键 `@foolish-you/streak-v1`，含 `historicalMax` 历史最长连签）。
- 文案：`lib/copy/streak.ts` 的 `formatStreakLine()`；今日已入账时顶栏连签高亮（`streakHighlight`）。

### 开发者：提交前本地检查（与 CI 一致）

GitHub Actions 工作流 `.github/workflows/ci.yml` 在 `main` / `master` 的 push 与 PR 上执行：

```bash
npm run typecheck      # tsc --noEmit
npm test               # Jest：unit（*.test.ts）+ rtl（*.test.tsx）
npm run test:migration # 存储迁移黄金样例
npm run lint           # expo lint
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
