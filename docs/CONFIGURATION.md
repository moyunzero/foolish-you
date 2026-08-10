<!-- generated-by: gsd-doc-writer -->

# Configuration

This document describes how **傻了么 (Brainfool)** is configured: Expo app metadata, EAS build profiles, TypeScript constants, local persistence keys, styling toolchain, and optional environment overrides.

## Environment variables

The app is **offline-first** and does not require environment variables for core gameplay. No `process.env` reads exist in application code today.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| *(none in repo)* | — | — | No `EXPO_PUBLIC_*` or other env vars are defined in source. |

`.env.example` documents conventions only:

- Copy to `.env.local` for local overrides (never commit real `.env` files).
- Use **`EXPO_PUBLIC_*`** only for values safe to embed in the client bundle.
- Apple/Google signing credentials belong in **EAS Secrets** or local `~/.eas`, not in the repository.

## Expo app config (`app.json`)

Primary Expo configuration (static JSON, no `app.config.js`).

| Area | Value | Notes |
|------|-------|-------|
| Display name | 傻了么 | User-facing app name |
| Slug / scheme | `foolish-you` | Deep links and Expo project slug |
| Version | `2.5.0` | Marketing version (aligned with `package.json`) |
| UI style | `dark` | System appearance default |
| New architecture | `true` | React Native new arch enabled |
| Entry | `expo-router/entry` | Set in `package.json` `main` |
| Plugins | `expo-router`, `expo-font`, `expo-localization`, `expo-notifications`, `@react-native-community/datetimepicker` | Router, fonts, locale, local reminders |
| iOS bundle ID | `com.moyunzero.foolish-you` | `buildNumber`: `30` in `app.json` → next production build **31** (`autoIncrement`) |
| Android package | `com.moyunzero.foolishyou` | `versionCode`: `3` |
| Splash / icons | `./assets/*` | Background `#0a0a0a` (matches design canvas) |

`expo.extra.eas.projectId` links the repo to EAS project `c966dcb9-f523-46a1-aa38-00053eb7d8d4`. <!-- VERIFY: EAS project ownership and dashboard URL if documenting for a team -->

## EAS build (`eas.json`)

| Profile | Purpose | Key settings |
|---------|---------|--------------|
| `development` | Dev client | `developmentClient: true`, internal distribution |
| `preview` | Internal QA | Internal distribution; Android `buildType: apk` |
| `production` | Store builds | `autoIncrement: true` for build numbers |

CLI requires **EAS CLI >= 16.0.0**. `appVersionSource` is `local` (`ios.buildNumber` in `app.json`; production profile uses `autoIncrement`).

npm scripts:

```bash
npm run build:preview:android
npm run build:preview:ios
npm run build:production
```

Submit profile `production` is defined but empty in-repo; store credentials are configured in EAS. <!-- VERIFY: App Store Connect / Play Console linkage in EAS dashboard -->

## Store distribution

| Channel | Status | Notes |
|---------|--------|-------|
| **iOS App Store** | **Live `2.5.0`** | [App Store](https://apps.apple.com/app/id6770218110) · Bundle `com.moyunzero.foolish-you` · CN「傻了么」/ US「Brainfool」 |
| **Google Play** | Not published | Package `com.moyunzero.foolishyou` configured in `app.json` only |

### iOS build number vs App Store Connect

`eas.json` uses `appVersionSource: local` and production `autoIncrement: true`. Each production iOS build bumps `app.json` → `ios.buildNumber` before compiling.

If upload fails with **「捆绑包版本必须高于之前上传的版本 "N"」** / *build number already used*:

1. Open App Store Connect → your app → **Activity** (or the version’s build list) and note the **highest build number already uploaded** (e.g. `25`).
2. Set `app.json` → `expo.ios.buildNumber` to that number (e.g. `"25"`), save, then run a **new** production build — `autoIncrement` will produce **N+1** (e.g. `26`).
3. Submit the **new** `.ipa` from that build. Re-submitting an old artifact with the same build number always fails.

Previously `appVersionSource` was `remote`; EAS remote counter (`eas build:version:get`) can drift from App Store Connect if builds were uploaded outside EAS or counters were reset. Local source avoids that mismatch for store releases.

### App Store · 更新说明（`2.5.0` What's New · 已上架）

已用于 App Store Connect → 版本 **2.5.0** → **更新说明**（中/英各一份）。隐私政策与权限无变更。

> Content Depth（原单独规划的 `2.4.2`）与 Adaptive Mastery **一并**随本版上架；未单独发布 `2.4.2`。

**中文（傻了么 · 中国区）**

```
· 数独、二进制的一周难度节奏更清楚：周一更轻松，周日更有挑战
· 数回难度梯度拉宽；数绘图案库扩充到 120
· 四种玩法会按你的掌握度悄悄调整难度，仍是一天一局
· 本机记录已玩过的盘面，减少短期内重复撞题
· 更新后，尚未游玩的日期盘面可能变化；进行中的进度会保留
```

**English（Brainfool · United States）**

```
· Clearer week rhythm for Sudoku and Binary—easier Mondays, tougher Sundays
· Wider Slitherlink stretch; Nonogram library expanded to 120
· All four puzzles quietly adapt to your mastery—still one game a day
· Local history avoids recent boards so repeats feel rarer
· After updating, boards for dates you have not opened yet may change; in-progress progress is kept
```

### App Store · 更新说明（`2.4.1` What's New · 已上架）

粘贴到 App Store Connect → 版本 **2.4.1** → **更新说明**（中/英各一份）。隐私政策与权限无变更。

**中文（傻了么 · 中国区）**

```
· 游戏页更干净：顶栏精简，放弃入口退后，确认改成底部面板
· 结果页先看 punchline，「结局」与「数据」分区更清楚
· 修复月历周六列空白等问题
```

**English（Brainfool · United States）**

```
· Cleaner play screen: slim header, quieter bail link, bottom-sheet confirm
· Results lead with the punchline; clearer outcome vs stats sections
· Calendar Saturday column fix and polish
```

### App Store · 更新说明（`2.4.0` What's New · 已上架）

粘贴到 App Store Connect → 版本 **2.4.0** → **更新说明**（中/英各一份）。隐私政策与权限无变更。

**中文（傻了么 · 中国区）**

```
· 每周日开出「周日特辑」：进游戏多一句仪式感问候，通关或认怂也更有约会感——不加压、不额外一局
· 数绘图案库大幅扩充，更多幽默小图轮着来
· 修复与体验优化
```

**English（Brainfool · United States）**

```
· Sundays get a Sunday Special: a short ritual greeting in-game, and warmer roast energy on clear or bail—still one puzzle a day, no harder rules
· More Nonogram pictures in the pool—extra cheeky 8×8 grids to rotate through
· Bug fixes and polish
```

可选截图：`docs/qa/v2.4-sunday-special/evidence/20260715/screenshots/01-sunday-game-subline.png.png`、`04-sunday-complete-roast.png.png`。

### App Store · 更新说明（`2.3.0` What's New · 已上架）

粘贴到 App Store Connect → 版本 **2.3.0** → **更新说明**（中/英各一份）。隐私政策与权限无变更。

**中文（傻了么 · 中国区）**

```
· 同一种谜题玩顺手了，偶尔会在结果页多一句「你今天格外顺」——不比较、不排行
· 还是老规矩：来得勤有近况、好久不见会欢迎，认怂不打击
· 修复与体验优化
```

**English（Brainfool · United States）**

```
· When the same puzzle type clicks, you might get a quiet “that felt smooth” line—no rankings, no speed battle
· Same gentle rules: show-up streak lines when you’re on a roll, welcome back after a break, no pile-on when you bail
· Bug fixes and polish
```

可选截图：`docs/qa/v2.3-same-type-smoother/evidence/20260629/screenshots/01-result-smoother-growth-line.png`。

### App Store · 更新说明（`2.2.0` What's New · 已上架）

粘贴到 App Store Connect → 版本 → **更新说明**（中/英各一份）。隐私政策与权限无变更。

**中文（傻了么 · 中国区）**

```
· 通关后，来得勤时会多一句「近况」——不唠叨，只在值得说的时候说
· 月历里本月总结更有人味；比上个月多坚持时，会轻轻点一下
· 好久不见再来，即使今天认怂，也会欢迎回来
· 修复与体验优化
```

**English（Brainfool · United States）**

```
· After you clear a puzzle, a gentle “you’ve been showing up” line when you’re on a roll—not every day
· Month calendar summary feels more personal; see when you’re ahead of last month
· Welcome back—even on a bail-out day after a long break
· Bug fixes and polish
```

可选截图：`docs/qa/v2.2-gentle-growth/evidence/20260620/screenshots/`（结果页成长行 02/04/06，月历 delta 05，英文 08）。

Retention and acquisition KPIs: **App Store Connect → Analytics** (no third-party analytics SDK in-app). See README § 版本与规划.

Public privacy policy URL (configure in App Store Connect): `constants/legal.ts` → `PRIVACY_POLICY_URL` (GitHub Pages under `docs/` — ensure Pages deploy is live before store review).

### App Store · 产品页文案（ASO 轻改 · 待粘贴）

**目的：** 去掉「高难度」硬预期，对齐一天一局 + 毒舌仪式 + 静默自适应（2.5）；不承诺多题/排行/提示。  
**操作：** App Store Connect → App 信息 → 本地化（中国区 / 美国区）→ 副标题 + 描述。通常**不需**重新提审二进制；若 ASC 要求随版本元数据提交，挂下一次小版本即可。

**副标题（≤30 字 · 中国区）**

```
每天一题，毒舌收尾
```

**副标题（≤30 characters · United States）**

```
One puzzle. Sharp send-off.
```

**描述（中国区 · 替换「高难度」版）**

```
傻了么是一款极简的每日益智游戏：每天只开一局。

打开 App，系统在数独、二进制、数绘、数回里随机给你今天这一题。玩完或认怂，都会收到一句带点毒舌的收尾——明天再来。

· 一天一局，不做成刷题工具箱
· 离线也能玩，进度保存在本机
· 难度会按你的节奏悄悄调整，不做难度徽章
· 连签护盾、月历与图鉴，温和陪你养成习惯

没有排行榜，没有好友，没有填格提示。专注今天这一局。
```

**Description（United States · Brainfool）**

```
Brainfool is a minimalist daily puzzle: one game a day.

Open the app and get today’s board—Sudoku, Binary, Nonogram, or Slitherlink—chosen for you. Finish or bail, then get a sharp little send-off. Come back tomorrow.

· One game a day—not an endless puzzle gym
· Fully offline; progress stays on your device
· Difficulty quietly adapts—no badges, no mode picker
· Streak shields, month calendar, and gallery keep the habit gentle

No leaderboards, no friends list, no fill-in hints. Just today’s one game.
```

> **勿写：** 高难度 / 最难 / 无限关卡 / 排行榜 / 提示。与产品红线冲突。

## Application constants (`constants/config.ts`)

Central runtime constants for puzzles, persistence, and debouncing.

| Constant | Value | Role |
|----------|-------|------|
| `APP_SALT` | `foolish-you-v1` | Date-seed salt (client-visible, not a secret). Same calendar day + device → same daily puzzle. |
| `STORAGE_KEY` | `@foolish-you/daily-v1` | AsyncStorage key for daily game snapshot |
| `STREAK_STORAGE_KEY` | `@foolish-you/streak-v1` | AsyncStorage key for streak state |
| `STREAK_STORAGE_VERSION` | `3` | Streak schema (adds `freezeCount`, `lastFreezeGrantWeekKey`, `freezeConsumedSessionKey`) |
| `COMPLETION_HISTORY_STORAGE_KEY` | `@foolish-you/completion-history-v1` | Rolling completion records for stats |
| `COMPLETION_HISTORY_STORAGE_VERSION` | `3` | Completion history schema (v2 adds `outcome`; v3 adds optional `gameType`) |
| `COMPLETION_HISTORY_MAX_ENTRIES` | `90` | Cap on stored completion rows |
| `RATING_STORAGE_KEY` | `@foolish-you/rating-v1` | Rating prompt counters / last prompt date |
| `RATING_STORAGE_VERSION` | `1` | Rating state schema |
| `MASTERY_STORAGE_KEY` | `@foolish-you/mastery-v1` | Per-gameType FSRS-lite mastery blob (v2.5) |
| `MASTERY_STORAGE_VERSION` | `1` | Mastery state schema (`byType` rows) |
| `PLAYED_HASH_STORAGE_KEY` | `@foolish-you/played-hash-v1` | Per-gameType FIFO ring of recent completed puzzle hashes (v2.5 DIV-01) |
| `PLAYED_HASH_STORAGE_VERSION` | `1` | Played-hash ring schema (`version` + `byType` string arrays) |
| `PLAYED_HASH_RING_CAPACITY` | `200` | Max hashes retained per `gameType` (FIFO drop oldest) |
| `AVOID_HASH_MAX_ATTEMPTS` | `40` | Generate/select retries while hash is in the avoid set (DIV-02) |
| `RECOVERY_LOG_STORAGE_KEY` | `@foolish-you/snapshot-recovery-log-v1` | Ring buffer of snapshot recovery events |
| `RECOVERY_LOG_MAX_ENTRIES` | `10` | Max recovery log entries retained |
| `STORAGE_VERSION` | `2` | Persisted snapshot schema version (v2 drops legacy `puzzleStub`) |
| `SUDOKU_GIVEN_COUNT` | `30` | Given cells for 9×9 Sudoku |
| `SUDOKU_MAX_GEN_ATTEMPTS` | `50` | Generator retry cap |
| `BINARY_GIVEN_COUNT` | `24` | Given cells for 8×8 Takuzu (~38%) |
| `BINARY_MAX_GEN_ATTEMPTS` | `40` | Generator retry cap |
| `SLITHERLINK_MIN_CLUES` | `18` | Minimum clue cells for 7×7 Slitherlink dailies |
| `SLITHERLINK_MAX_GEN_ATTEMPTS` | `50` | Slitherlink generator retry cap |
| `PLAY_STATE_DEBOUNCE_MS` | `300` | Debounce before writing play state to disk |
| `GROWTH_SMOOTHER_MIN_SAMPLES` | `3` | Same-type smoother: min prior completions (same `gameType` + `weekdayBand`) |
| `GROWTH_SMOOTHER_MEDIAN_RATIO` | `0.75` | Smoother triggers when today `elapsedMs` **<** median × ratio (strict) |

Changing `APP_SALT` or daily selection logic without product approval breaks **daily determinism** for existing users.

## Development flags (`constants/dev.ts`)

All dev-only behavior is gated by `__DEV__` (stripped from production builds).

| Export | Default | Behavior |
|--------|---------|----------|
| `DEV_TOOLS_ENABLED` | `__DEV__` | Enables dev tools panel |
| `DEV_TOOLS_BAR_HIDDEN_DEFAULT` | `false` | Dev bar visible on launch in dev builds |
| `DEV_FORCE_GAME_TYPE` | `null` | Force `sudoku` \| `binary` \| `nonogram` \| `slitherlink` when set; `null` = date-seed random (production behavior) |
| `getDevForceGameType()` | — | Returns `null` outside `__DEV__` regardless of constant |

`DEV_FORCE_GAME_TYPE` applies when creating a **new** today snapshot (e.g. after dev “reset today” or clearing storage). It does not affect release builds.

## Design tokens (`constants/design.ts` + Tailwind)

Colors are defined in three places that should stay aligned:

1. **`constants/design.ts`** — `colors` object for inline styles (ActivityIndicator, Reanimated, dynamic layout).
2. **`tailwind.config.js`** — NativeWind `className` tokens (`canvas`, `accent-sunset`, etc.).
3. **`global.css`** — CSS variables under `:root` for BEM-style utilities.

| Token | Hex | Typical use |
|-------|-----|-------------|
| `canvas` | `#0a0a0a` | App background |
| `canvasCard` / `canvas-card` | `#191919` | Cards |
| `canvasSoft` / `canvas-soft` | `#1a1c20` | Soft surfaces |
| `hairline` | `#212327` | Borders |
| `ink` | `#ffffff` | Primary text |
| `body` | `#dadbdf` | Body text |
| `muted` | `#7d8187` | Secondary text |
| `accentSunset` / `accent-sunset` | `#ff7a17` | Sudoku conflicts, accents |
| `sudokuGiven` / `sudoku-given` | `#b8bcc4` | Given digits |
| `sudokuError` / `sudoku-error` | `#f87171` | Error/conflict digits |
| `primary` / `onPrimary` | `#ffffff` / `#0a0a0a` | Buttons |

See `DESIGN.md` for product-level design rules.

## Local storage keys (AsyncStorage)

| Key | Defined in | Payload | Access |
|-----|------------|---------|--------|
| `@foolish-you/daily-v1` | `constants/config.ts` → `STORAGE_KEY` | `DailySnapshot` JSON (versioned, migrated on load) | `lib/storage/dailyStorage.ts` |
| `@foolish-you/streak-v1` | `constants/config.ts` → `STREAK_STORAGE_KEY` | `StreakState`: `{ currentStreak, lastCheckInDateKey, historicalMax, freezeCount, lastFreezeGrantWeekKey, freezeConsumedSessionKey? }` (schema v3) | `lib/storage/streakStorage.ts` |
| `@foolish-you/completion-history-v1` | `COMPLETION_HISTORY_STORAGE_KEY` | Completion records for weekly stats / backfill | `lib/storage/completionHistoryStorage.ts` |
| `@foolish-you/rating-v1` | `RATING_STORAGE_KEY` | Rating prompt state | `lib/storage/ratingStorage.ts` |
| `@foolish-you/mastery-v1` | `MASTERY_STORAGE_KEY` | Per-gameType mastery (`version` + `byType`) | `lib/storage/masteryStorage.ts` |
| `@foolish-you/played-hash-v1` | `PLAYED_HASH_STORAGE_KEY` | Per-gameType played-hash rings (`version` + `byType`) | `lib/storage/playedHashStorage.ts` |
| `@foolish-you/snapshot-recovery-log-v1` | `RECOVERY_LOG_STORAGE_KEY` | Recovery event log (dev-visible) | `lib/storage/recoveryLog.ts` |
| `@foolish-you/dev-tools-bar-visible` | `contexts/DevToolsUiContext.tsx` (local constant) | `'1'` / `'0'` for dev bar visibility | Dev builds only |

**Daily snapshot migration:** On load, `migrateSnapshot()` in `lib/storage/snapshotMigration.ts` normalizes v0/v1 data to `STORAGE_VERSION` (2). Snapshots with `version > STORAGE_VERSION` are rejected with a warning. **`recoverSnapshot()`** may repair puzzle data or strip invalid `playState` when `status: 'completed'` but the board is incomplete.

**Native modules (v1.1):** `expo-clipboard` (share card), `expo-store-review` (rating prompt) — bundled with Expo SDK 54; no extra env config.

**Required for gameplay:** None of these keys are pre-seeded; missing keys mean a fresh install flow.

## Storage version bumps

When changing persisted JSON shape, bump the version constant in `constants/config.ts` and add a read/migration path plus tests. Never ship a bump without both.

| Store | Constant | Touch on bump |
|-------|----------|---------------|
| Daily snapshot | `STORAGE_VERSION` | `lib/storage/snapshotValidate.ts`, `snapshotPrep.ts`, `snapshotMigration.ts`, `snapshotLegacy.ts`, golden fixtures in `__tests__/lib/storage/migration/` |
| Streak | `STREAK_STORAGE_VERSION` | `lib/storage/streakStorage.ts`, `__tests__/lib/storage/streakStorage.test.ts` |
| Completion history | `COMPLETION_HISTORY_STORAGE_VERSION` | `lib/storage/completionHistoryStorage.ts`, `lib/storage/backfillCompletionHistory.ts`, related tests |
| Rating prompt state | `RATING_STORAGE_VERSION` | `lib/storage/ratingStorage.ts`, related tests |
| Mastery (per gameType) | `MASTERY_STORAGE_VERSION` | `lib/storage/masteryStorage.ts`, `__tests__/lib/storage/masteryStorage.test.ts` |
| Played-hash ring (per gameType) | `PLAYED_HASH_STORAGE_VERSION` | `lib/storage/playedHashStorage.ts`, `__tests__/lib/storage/playedHashStorage.test.ts` |

Recovery log (`RECOVERY_LOG_*`) and dev-only keys do not use schema version constants — append-only / dev scope only.

Mastery lives under its own key — do **not** bump daily `STORAGE_VERSION` solely for mastery fields.

Played-hash ring lives under its own key (`playedHashStorage`) — introducing or bumping it must **not** bump daily `STORAGE_VERSION` or `MASTERY_STORAGE_VERSION` (D-12).

## Bundler and styling toolchain

### Babel (`babel.config.js`)

- Presets: `babel-preset-expo` with `jsxImportSource: 'nativewind'`, plus `nativewind/babel`.
- Plugins: `react-native-reanimated/plugin` (**must be last** in the plugins list per Reanimated docs).

### Metro (`metro.config.js`)

- Base: `expo/metro-config` default config.
- Wrapped with `nativewind/metro` and `input: './global.css'`.

### Tailwind / NativeWind (`tailwind.config.js`)

- **Content globs:** `./app/**/*`, `./components/**/*`
- **Preset:** `nativewind/preset`
- **Theme:** extended `colors` mirror `constants/design.ts`

TypeScript: `tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`.

## Required vs optional settings

| Setting | Required? | Failure mode |
|---------|-----------|----------------|
| AsyncStorage | Yes (platform) | Load/save warns and returns null/false; app may start fresh |
| `.env` / `.env.local` | No | Not read by app code today |
| EAS secrets (signing) | Yes for cloud builds | Build fails on EAS without credentials |
| `APP_SALT` / `STORAGE_VERSION` | Compiled in | Changing without migration plan breaks existing installs |

## Defaults summary

- **Daily puzzle type:** Random by local date seed (`APP_SALT` + date key), unless `DEV_FORCE_GAME_TYPE` is set in dev.
- **Persist debounce:** 300 ms (`PLAY_STATE_DEBOUNCE_MS`).
- **Dev tools bar:** Visible on launch in dev (`DEV_TOOLS_BAR_HIDDEN_DEFAULT = false`); toggle via long-press on privacy policy (see dev panel docs).

## Per-environment overrides

| Environment | Mechanism |
|-------------|-----------|
| Local dev | `expo start`; optional `.env.local` with `EXPO_PUBLIC_*` (unused in code today) |
| Dev client | EAS profile `development` |
| Internal QA | EAS profile `preview` (APK on Android) |
| Production | EAS profile `production`; `autoIncrement` build numbers |

`NODE_ENV` / `__DEV__` control dev-only code paths; there are no `.env.development` / `.env.production` files in the repo.

## Related docs

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layers, data flow, storage orchestration |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Verification, frontend CR, DevTools |
| [TESTING.md](./TESTING.md) | Jest layout, CI gates, manual QA |
| [AGENTS.md](../AGENTS.md) | Production invariants, layer rules |
| [README.md](../README.md) | Human onboarding |
| `DESIGN.md` | Visual contract (local, gitignored) |
