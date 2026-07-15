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
| Version | `2.4.0` | Marketing version (aligned with `package.json`) |
| UI style | `dark` | System appearance default |
| New architecture | `true` | React Native new arch enabled |
| Entry | `expo-router/entry` | Set in `package.json` `main` |
| Plugins | `expo-router`, `expo-font`, `expo-localization`, `expo-notifications`, `@react-native-community/datetimepicker` | Router, fonts, locale, local reminders |
| iOS bundle ID | `com.moyunzero.foolish-you` | `buildNumber`: `27` in `app.json` → next production build **28** (`autoIncrement`) |
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
| **iOS App Store** | **Live `2.4.0`** | [App Store](https://apps.apple.com/app/id6770218110) · Bundle `com.moyunzero.foolish-you` · CN「傻了么」/ US「Brainfool」 |
| **Google Play** | Not published | Package `com.moyunzero.foolishyou` configured in `app.json` only |

### iOS build number vs App Store Connect

`eas.json` uses `appVersionSource: local` and production `autoIncrement: true`. Each production iOS build bumps `app.json` → `ios.buildNumber` before compiling.

If upload fails with **「捆绑包版本必须高于之前上传的版本 "N"」** / *build number already used*:

1. Open App Store Connect → your app → **Activity** (or the version’s build list) and note the **highest build number already uploaded** (e.g. `25`).
2. Set `app.json` → `expo.ios.buildNumber` to that number (e.g. `"25"`), save, then run a **new** production build — `autoIncrement` will produce **N+1** (e.g. `26`).
3. Submit the **new** `.ipa` from that build. Re-submitting an old artifact with the same build number always fails.

Previously `appVersionSource` was `remote`; EAS remote counter (`eas build:version:get`) can drift from App Store Connect if builds were uploaded outside EAS or counters were reset. Local source avoids that mismatch for store releases.

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

Recovery log (`RECOVERY_LOG_*`) and dev-only keys do not use schema version constants — append-only / dev scope only.

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
