# Phase 1 Research: 基础骨架与每日管道

**Researched:** 2026-05-16  
**Confidence:** HIGH（继承 `.planning/research/*` + CONTEXT D-01–D-03）

## Standard Stack（本阶段）

| 类别 | 选择 | 备注 |
|------|------|------|
| Runtime | Expo SDK **54** | per D-02；`npx expo install` 锁版本 |
| Dev | **Expo Go** | per D-01 |
| Router | expo-router ~6 | `app/index`, `game`, `result`, `(auth)/login` |
| Styling | NativeWind v4 + Tailwind 3.4 | token 来自 `DESIGN.md` |
| Storage | @react-native-async-storage/async-storage | `lib/storage/dailyStorage.ts` |
| Test | jest + jest-expo | **仅** `lib/**` 单测，RN 屏手测 |

## Architecture Patterns（本阶段）

- **四层：** `lib/puzzles` → `lib/storage` → `hooks/useDailyGame` → `app/`
- **启动：** `index` hydrate → `<Redirect />`（不用 `initialRouteName` 做业务分流）
- **dateKey：** `getLocalDateKey()` 本地自然日，禁止 UTC `toISOString().slice(0,10)`
- **种子：** mulberry32 + `hash(dateKey + salt)`；同日读存储不复算
- **Phase 1 puzzle：** `dailySelector` 返回 stub payload（`sudoku` | `binary`），无真实生成器

## Critical Pitfalls（本阶段必避）

1. UTC 日期键 → 用 `getLocalDateKey()`
2. App 从后台恢复 → `AppState` 重算 dateKey，跨日则 rollover
3. `Math.random()` / 每次启动重选 → 持久化完整 `DailySnapshot`
4. AsyncStorage 未 hydrate 就 Redirect → `status: 'loading'` 直到读完
5. 存储 JSON 无 schema 版本 → `STORAGE_VERSION` + 迁移占位

## UI Implementation Notes

- 视觉契约：`01-UI-SPEC.md` + `DESIGN.md`
- 组件：`OutlinePillButton`、`HairlineCard`（描边胶囊 + 8px 卡片）
- 字体：Inter + Space Mono（眉标）

## Out of Scope（本阶段）

- Sudoku/Binary 生成与 Grid 交互（Phase 2/3）
- FunnyFeedback / reanimated 结果动效（Phase 4）
- EAS Build、真实登录（D-03 / AUTH v2）

## Sources

- `.planning/research/STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md`
- `.planning/phases/01-foundation-daily-pipeline/01-CONTEXT.md`
- Expo: [Expo Router redirects](https://docs.expo.dev/router/reference/redirects/)
