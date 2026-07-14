# 傻了么 (Brainfool)

**English** | [简体中文](./README.zh-CN.md)

> A minimalist **daily puzzle** app. Open it once a day and the app hands you exactly one randomly assigned puzzle — **Sudoku**, **Binary (Takuzu/Binairo)**, **Nonogram (Picross)**, or **Slitherlink** — then closes the loop with a sharp-tongued one-liner. New puzzle at local midnight.

<p>
  <img alt="version" src="https://img.shields.io/badge/version-2.3.0-blue" />
  <img alt="platform" src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey" />
  <img alt="expo" src="https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo" />
  <img alt="tests" src="https://img.shields.io/badge/tests-529%20passing-success" />
</p>

No social feeds, no leaderboards, no fill-in hints — just **today's one game**.

**iOS App Store:** Live [`2.3.0`](https://apps.apple.com/app/id6770218110) (same-type smoother). Android (Google Play) is not published yet.

**For AI / contributors:** production invariants and layer rules live in [`AGENTS.md`](./AGENTS.md); verification, code review, and manual QA checklists in [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) and [`docs/TESTING.md`](./docs/TESTING.md); the GSD workflow in [`CLAUDE.md`](./CLAUDE.md).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Development Tools](#development-tools)
- [Testing](#testing)
- [Build & Release](#build--release)
- [Roadmap](#roadmap)
- [Usage Examples](#usage-examples)
- [License](#license)
- [Documentation](#documentation)

---

## Features

| Capability | Description |
|------------|-------------|
| Daily puzzle | Game type and board are derived from the local calendar day + a seed; reopening the same day is deterministic |
| Sudoku | Standard 9×9, conflict highlighting, complete / surrender |
| Binary | 8×8, four `0`s and four `1`s per row and column, no triples, no duplicate rows/columns |
| Nonogram | 8×8 Picross with row/column clues, validated on completion, pattern revealed on the result screen |
| Slitherlink | 7×7 single closed loop on edges, conflict highlighting, loop revealed on the result screen |
| Offline-first | Puzzles are generated and validated on-device; no network required |
| Persistence | Today's state is saved to AsyncStorage; resume after force-quit |
| Result screen | Randomized humorous copy + Reanimated entrance animations + "come back tomorrow" |
| Session timer | `MM:SS` elapsed time; foreground/background and system-clock correction (no backward jumps) |
| Rules sheet | A `?` next to the game title opens the how-to-play modal |
| **v1.1** Emoji recap | "Copy recap" on the result screen: emoji grid + time/streak written to the clipboard (`expo-clipboard`) |
| **v1.1** Stats cards | Today's time, days completed this week, all-time longest streak (three compact cards) |
| **v1.1** Rating prompt | Threshold-gated, delayed system store-review request after a win (`expo-store-review`; dismissable, non-blocking) |
| **v1.1** Defensive flow | Daily selection solvability check + built-in fallback; snapshot repair; strips `playState` when `completed` contradicts an incomplete board |
| **v1.2** System locale | Follows device `zh` / `en` (English brand **Brainfool**); bilingual privacy policy; **no** in-app language setting in release |
| **v2.0** Slitherlink | 7×7 added to the daily rotation; tri-state edges, conflict highlighting, spoiler-free recap |
| **v2.0** Streak Freeze | One shield granted weekly (max 2 stacked); a single missed day auto-consumes a shield on next open |
| **v2.0** Missed-yesterday recall | When a day is missed without a shield, the game header shows a recall subline (mutually exclusive with the shield line) |
| **v2.1** Weekday difficulty | Monday→Sunday ramp within the same game type (no UI difficulty label); `APP_SALT` / type selection unchanged |
| **v2.1** Month calendar | "View this month" on the result screen → bottom sheet with four states (win / surrender / miss / shield) + streak & monthly summary |
| **v2.1** Daily reminder | First-win soft ask + 20:00 game-screen banner + ReminderSheet; one local routine notification |
| **v2.1** Month gallery | "Generate this month's gallery" → portrait PNG shared via the system sheet |
| **v2.2** Gentle growth | Result “recent streak” line + calendar growth summary; never-negative tone |
| **v2.3** Same-type smoother | Extra positive result line when the same puzzle type feels clearly faster (sample + median gate); no speed PK |

**Out of scope:** accounts/login, a personal **stats dashboard** (the summary is merged into the calendar), fill-in hints, social/leaderboards/friends (see the [Roadmap](#roadmap)).

---

## Tech Stack

- [Expo SDK 54](https://docs.expo.dev/) + [expo-router](https://docs.expo.dev/router/introduction/) (file-based routing)
- React Native 0.81 · React 19 · TypeScript (strict)
- [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) (result-screen animations)
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) (local persistence)
- Puzzle logic: pure TypeScript (`lib/puzzles/`) — generators, solvers, and validators

Targets **iOS** and **Android** (managed workflow; no committed `ios/` / `android/` native directories).

---

## Requirements

- **Node.js** 22 LTS (matches CI; repo `.nvmrc` is `22`)
- **npm** 11+ (matches CI; `package-lock.json` is canonical — install with `npm ci`)
- **iOS:** Xcode + Simulator (macOS only), or [Expo Go](https://expo.dev/go)
- **Android:** Android Studio emulator, or a device with Expo Go

---

## Quick Start

```bash
# Clone
git clone https://github.com/moyunzero/foolish-you.git
cd foolish-you

# Install dependencies
npm install

# Start the dev server
npm start
```

In the terminal, press `i` for the iOS Simulator, `a` for the Android emulator, or scan the QR code with **Expo Go**.

If you changed `babel.config.js` (e.g. the Reanimated plugin) or native dependencies, start with a cleared cache:

```bash
npx expo start -c
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo dev server |
| `npm run ios` | Run on the iOS Simulator/device (requires prebuild or a dev client) |
| `npm run android` | Run on Android |
| `npm run web` | Web preview (not the primary target) |
| `npm test` | Run Jest unit + RTL tests (puzzles, storage, context, screens) |
| `npm run test:migration` | Run only the storage-migration golden samples (matches CI) |
| `npm run typecheck` | TypeScript strict check (`tsc --noEmit`) |
| `npm run lint` | ESLint (`expo lint`) |

---

## Project Structure

For the full tree and "where new code goes," see [`docs/DEVELOPMENT.md` § Code layout](./docs/DEVELOPMENT.md#code-layout). Architecture and data flow are in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

```
foolish-you/
├── app/                    # expo-router screens (no puzzle algorithms)
├── components/
│   ├── grid/               # SudokuGrid, BinaryGrid, NonogramGrid, SudokuNumpad
│   ├── slitherlink/        # SlitherlinkBoard (tri-state edges)
│   ├── game/               # per-type Sections, Header/Footer, rules modal
│   ├── result/             # badges, stats cards, recap, Nonogram/Slitherlink reveal cards
│   ├── ui/ · legal/ · dev/
├── contexts/               # DailyGameContext, DevToolsUiContext
├── hooks/                  # per-type board hooks, useGameBoardSession, useElapsedTimer
├── lib/
│   ├── date/ · daily/ · puzzles/ · storage/ · streak/ · completion/
│   ├── share/ · stats/ · rating/ · time/ · copy/ · i18n/ · dev/ · platform/
├── locales/                # zh / en
├── constants/              # config, design, dev, legal
└── __tests__/              # lib/ · contexts/ · hooks/ · components/ · screens/
```

### Core Flow

1. **Launch** → `DailyGameContext` loads or creates today's record (`dateKey` + `seed` + `gameType` + board).
2. **Selection** → `lib/puzzles/dailySelectorSafe.ts` (solvability check + fallback when needed) stably randomizes across Sudoku / Binary / Nonogram / Slitherlink from the date seed and generates a solvable board.
3. **Play** → `app/game.tsx` renders the matching grid and footer by `gameType`; progress is debounced to local storage.
4. **End** → complete or surrender → `app/result.tsx` shows copy and animations; a new game starts automatically once `dateKey` changes the next day.

---

## Development Tools

In development (`__DEV__`), a **dev panel** on the home screen lets you regenerate today, force a game type, and preview locales via the **settings placeholder**. See `constants/dev.ts`.

```ts
// constants/dev.ts
export const DEV_FORCE_GAME_TYPE: GameType | null = 'sudoku'; // null = same random as production; 'binary' | 'nonogram' | 'slitherlink'
```

Release builds never include this panel.

---

## Testing

```bash
npm test
```

Coverage: date utilities, RNG, daily and safe selection, Sudoku/Binary/Nonogram/Slitherlink generation and validation, storage migration/recovery, completion history, recap and stats, rating thresholds, streaks, i18n (incl. `en-smoke`), and context/screen RTL — **476** tests. Plus `npm run test:migration` golden samples. UI animations and on-device layout are covered by manual QA.

---

## Build & Release

Use [EAS Build](https://docs.expo.dev/build/introduction/) or a local prebuild:

```bash
# Install and sign in first: npm install -g eas-cli && eas login
eas build --platform ios
eas build --platform android

# Or use the project scripts (preview profile)
npm run build:preview:ios
npm run build:preview:android
```

`app.json` configures the app name **傻了么**, bundle ID `com.moyunzero.foolish-you`, and a dark UI. The current **iOS production build `2.3.0`** is shipped via the EAS `production` profile to App Store Connect. Retention KPIs are read from App Store Connect Analytics — there is no third-party analytics SDK in the app.

---

## Roadmap

> Full internal detail in `.planning/ROADMAP.md`.

### Design Constitution (hard lines · non-negotiable)

- **Offline-first:** `dateKey + seed` determines the board; never fetched remotely.
- **One game a day:** never becomes "three puzzles a day" — the tension comes from uniqueness.
- **Won't build:** leaderboards, friends, IM, IAP, ads, hint buttons, shields stacking beyond 2.
- **Sharp humor** is the brand moat; every line of copy must clear that bar.

### North Star & Cadence

| Stage | D1 | D7 | D30 | Rating | Complete → Share |
|-------|----|----|-----|--------|------------------|
| v1.0 (shipped baseline) | — | — | — | live | 0% (no entry) |
| v1.1 target (≈ 3 mo) | 32% | 12% | 5% | ≥ 4.4 | ≥ 3% |
| **Current v2.3 (`2.3.0`, iOS live)** | TBD (ASC) | TBD (ASC) | TBD (ASC) | ≥ 4.5 target | ≥ 5% target |
| Post-v2.0 (≈ 6 mo) | **35%+** | **15%+** | **7%+** | **≥ 4.5** | ≥ 5% |
| 12-month target | 38% | 18% | 9% | 4.6 | 7% |

> The goal is to move "傻了么" from the puzzle-subcategory median into the Top 25% (industry 35/15/5 baseline).

### Version Roadmap

| Version | Status | Scope | Key bet (data anchor) |
|---------|--------|-------|------------------------|
| **v1.0** | Released | Daily Sudoku / Binary / Nonogram (**no Slitherlink**), local progress, streaks, result animations, timer, rules modal | — |
| **v1.1** | Released (`1.1.x`) | ① Emoji recap copy (`lib/share/` + `expo-clipboard`); ② rating prompt (win + completion-count thresholds, `expo-store-review`); ③ three stat cards (today's time / weekly completions / all-time longest streak, `historicalMax`); ④ defenses: `selectDailyGameSafe`, snapshot `recoverSnapshot`, timer correction, migration + recovery tests, dev recovery log | Wordle's 90→300K DAU came from one-tap emoji sharing |
| **v1.2** | Released (`1.2.0`) | System locale zh/en (`expo-localization`); English brand **Brainfool**; `locales/` + `useI18n`; bilingual privacy; DevTools **settings placeholder** (no storage writes, no release entry) | Overseas readability + store compliance |
| **v2.0** | Live (in `2.1.0`) | ✅ Slitherlink 7×7; ✅ Streak Freeze; ✅ missed-yesterday recall | Duolingo: streak lifespan +48% |
| **v2.1** | **Live** (`2.1.0`; App Store 2026-06-09) | ✅ Weekday difficulty; ✅ month calendar + summary; ✅ daily reminder (A+D); ✅ month gallery PNG | NYT Mini/Midi cadence · D1→D2 |
| **v2.2** | **Live** (`2.2.0`) | ✅ Gentle growth: result “recent streak” line + calendar growth summary; no negative feedback | Mastery · non-competitive retention |
| **v2.3** | **Live** (`2.3.0`) | ✅ Same-type smoother easter egg: extra positive result line when same puzzle type feels clearly faster; rhythm-first; never-negative | Vertical mastery without speed PK |
| **v2.4** | Planned | Content depth: 5th puzzle type *or* Sunday special (one per day unchanged) | Rotation freshness |
| **v3.0** | Planned | QR backup/restore (progress + streak + calendar); optional Android ship in same cycle | Device transfer without accounts |
| **v3.1** | Planned | **Year in 傻了么** annual long-image (reuse month gallery pipeline) | Wrapped-style share; schedule before Q4 |
| **v4.0** | Planned | Anonymous challenge codes (“play my day”); optional aggregate social proof | Conversation without friend list |

Full decision rationale, A/B designs, and trade-offs are in `.planning/ROADMAP.md` (gitignored; not published with the repo).

---

## Usage Examples

### Player: finish today's game

1. Launch the app → `app/index.tsx` routes to `app/game.tsx` based on today's record.
2. The game header `GameScreenHeader` shows the date, session time, type title, streak subline (`streakLine`), and an optional shield/recall subline (`GameStreakSubline` — shield and missed-yesterday are mutually exclusive).
3. Fill the board, then tap **Complete** in the footer (`GameScreenFooter`) → on a valid solution you reach the result screen; **surrender** does not count toward the streak.
4. On the result screen you can tap **Copy recap** (requires a valid `playState`; if the board was stripped during recovery, only copy and stats are shown).
5. A new puzzle loads automatically once the local `dateKey` changes the next day.

### Streaks & shields (win-gated)

- **Only wins count toward the streak**; surrendering does not call `applyCheckIn` (see `contexts/DailyGameContext.tsx`).
- Logic: `lib/streak/streakLogic.ts` (+1 per consecutive day, reset on a gap); persistence: `lib/storage/streakStorage.ts` (key `@foolish-you/streak-v1`, schema v3, incl. `historicalMax`, `freezeCount`).
- **Streak Freeze:** `lib/streak/freezeLogic.ts` — one shield granted on the first open of each ISO week (max 2); if exactly one day was missed since the last check-in with no real completion, one shield is auto-consumed on hydrate.
- **Missed-yesterday recall:** `lib/streak/missedYesterdayBanner.ts` — when a day is missed without consuming a shield, the game header shows recall copy (mutually exclusive with the shield line).
- Copy: header streak in `lib/copy/streak.ts`; shield/recall in `lib/copy/freeze.ts` and `lib/copy/missedYesterday.ts`; result-card shield suffix in `locales/*/copy.ts`.

### Developer: pre-commit checks (matches CI)

The GitHub Actions workflow `.github/workflows/ci.yml` runs on push and PR to `main` / `master`:

```bash
npm run typecheck            # tsc --noEmit
npm test                     # Jest: unit (*.test.ts) + rtl (*.test.tsx)
npm run test:migration       # storage-migration golden samples
npm run lint                 # expo lint
npm run lockfile:verify-eas  # npm 10 ci; recommended before an EAS build
```

Optional split:

```bash
npm run test:unit   # pure logic: puzzles, storage, streaks
npm run test:rtl    # context- and screen-level RTL tests
```

---

## License

No open-source license has been specified yet. If you fork or redistribute, please confirm permission with the repository maintainer first.

---

## Acknowledgements

Puzzle algorithms and product inspiration come from classic Sudoku and Takuzu/Binairo rules; delivered on the Expo and React Native ecosystem.

---

## Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](./AGENTS.md) | AI/contributors: production invariants, layer rules, verification entry points |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Architecture, data flow, offline-first and persistence |
| [docs/GETTING-STARTED.md](./docs/GETTING-STARTED.md) | Install and first run |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Day-to-day development, CI checks, DevTools |
| [docs/TESTING.md](./docs/TESTING.md) | Jest dual projects and the manual QA checklist |
| [docs/CONFIGURATION.md](./docs/CONFIGURATION.md) | app.json, EAS, constants and storage keys |
