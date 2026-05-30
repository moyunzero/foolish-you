# Agent Guidelines — 傻了么 (Silly Me)

A **shipped, production** daily puzzle app (iOS / Android via Expo SDK 54). Real users run this — changes must preserve offline-first behavior, daily puzzle determinism, and existing storage shape.

## Workflow (read first)

| Document | Purpose |
|----------|---------|
| **`AGENTS.md`** (this file) | How to write code: architecture, UI, testing, production constraints |
| **`CLAUDE.md`** | Project summary + GSD workflow entry points |
| **`README.md`** | Human onboarding: install, commands, structure |

Before changing code: follow `CLAUDE.md` GSD workflow (`/gsd-quick`, `/gsd-debug`, `/gsd-execute-phase`) unless the user explicitly bypasses it. Before implementing a feature: read this file and match patterns in the touched directories.

---

## Project Overview

A minimal, offline-first daily puzzle app (Expo). One puzzle per local calendar day — randomly **Sudoku 9×9**, **Binary/Takuzu 8×8**, or **Nonogram/Picross 8×8**.

- Deterministic daily generation from date seed
- Local generation, validation, solving in `lib/puzzles/`
- Progress persistence via AsyncStorage
- Timer, conflict highlighting (Sudoku/Binary), complete / surrender flow
- Humorous result screen with Reanimated animations
- Rule explanations in-game
- **v1.1 (`1.1.x`):** emoji share card (clipboard), result stats cards, in-app review prompt (gated), defensive daily selection + snapshot recovery
- **v1.2 (current `1.2.0`):** system locale zh/en (`expo-localization`), English brand **Silly Me**, `locales/` + `useI18n`, bilingual privacy; no release settings UI (dev placeholder only)

Store builds via EAS (`eas.json`, `app.json`).

---

## Tech Stack (match `package.json`)

| Layer | Choice |
|-------|--------|
| Runtime | **Expo SDK 54** |
| Routing | **expo-router** v6 (file-based) |
| UI | **React Native** 0.81+ · **React 19** · **TypeScript** (strict) |
| Styling | **NativeWind v4** + Tailwind CSS 3.4 (`global.css`, `tailwind.config.js`) |
| Animation | **react-native-reanimated** (result screen) |
| Gestures | **react-native-gesture-handler** (installed; use when needed) |
| Storage | **@react-native-async-storage/async-storage** |
| Puzzle engine | Pure TypeScript in `lib/puzzles/` |
| Tests | **Jest** (dual project: `unit` + `rtl`) · **jest-expo** · **@testing-library/react-native** |
| Lint | **eslint.config.js** · `npm run lint` (`expo lint`) — enforced in CI |

**Do not add new major libraries** without strong justification and explicit user approval. Example: `react-native-gesture-handler` is already in the project — for a tap interaction, `Pressable` is enough unless you actually need drag.

---

## Non-negotiables

Production invariants. Break one, you break existing users.

- **Daily determinism.** Same `dateKey` + app version on the same device → same `seed`, game type, and puzzle payload. Do not change `APP_SALT`, `deriveSeed`, or selection logic without product approval.
- **Offline-first core.** No network for puzzle generation, validation, or persistence. v1.1 only adds local clipboard / system review prompt (still no backend).
- **Storage safety.** Always go through `lib/storage/` migration + validation paths. Never silently drop user progress. Bump version constants only with a tested read/migration path for each legacy shape (see *Storage version bumps*).
- **TypeScript strict.** Explicit types for boards, snapshots, game status. No `any` unless unavoidable — document why.
- **Dev-only stays dev-only.** `__DEV__` shortcuts must not affect release builds.

---

## Architecture

```
foolish-you/
├── app/                      # expo-router screens only
│   ├── index.tsx             # Entry: hydrate → game / result
│   ├── game.tsx              # Main play screen (sudoku | binary | nonogram)
│   ├── result.tsx            # Win / surrender outcome
│   ├── privacy.tsx           # Privacy policy screen
│   ├── settings.tsx          # Settings placeholder (__DEV__ only)
│   └── (auth)/login.tsx      # Login placeholder (v1 not implemented)
├── components/
│   ├── grid/                 # SudokuGrid, BinaryGrid, NonogramGrid, SudokuNumpad
│   ├── game/                 # GameScreenHeader, GameScreenFooter, rules modal/button, *GameSection
│   ├── result/               # Result badges, stats, ShareButton, NonogramRevealCard, animated body
│   ├── ui/                   # Shared UI (e.g. OutlinePillButton, HairlineCard)
│   ├── legal/                # Privacy policy blocks
│   └── dev/                  # DevToolsPanel (__DEV__ only)
├── contexts/
│   ├── DailyGameContext.tsx  # Canonical daily state + persistence
│   └── DevToolsUiContext.tsx # Dev panel UI state
├── hooks/
│   ├── useDailyGame.ts       # Re-export of DailyGameContext API
│   ├── useGameBoardSession.ts # Routes to sudoku / binary / nonogram board hooks
│   ├── useSudokuBoard.ts / useBinaryBoard.ts / useNonogramBoard.ts
│   └── useElapsedTimer.ts    # In-game elapsed timer
├── lib/
│   ├── date/                 # Local calendar day (dateKey)
│   ├── puzzles/              # Generation, validation, solvers, dailySelectorSafe
│   ├── storage/              # AsyncStorage, snapshot validate/migrate/recover, history, rating
│   ├── share/                # Share card builder (emoji grid)
│   ├── stats/                # Result stats cards
│   ├── rating/               # App Store review gating
│   ├── time/                 # Elapsed ms + clock formatting
│   ├── copy/                 # Locale-aware copy helpers (pools in locales/)
│   ├── i18n/                 # resolveLocale, I18nProvider, format, gameLabels
│   └── platform/             # Platform helpers (e.g. exitApp)
├── locales/                  # zh / en strings (ui, copy, privacy, patterns)
├── constants/                # config, design tokens, dev flags, legal
├── assets/                   # Icons, splash
└── __tests__/                # Jest unit + rtl
```

### Layer rules

| Layer | Responsibility |
|-------|----------------|
| `app/` | Routes and screen composition only. Use context/hooks; no puzzle algorithms. |
| `components/` | Reusable UI. Extract when reused **or** when a screen becomes hard to read. |
| `contexts/DailyGameContext.tsx` | **Source of truth** for today's game: hydrate, play state, persist, complete/abandon. |
| `hooks/useDailyGame.ts` | Thin re-export — do **not** duplicate orchestration here. |
| `lib/puzzles/` | All generation, validation, solving; deterministic and unit-tested. Hydrate uses `selectDailyGameSafe` for solvability + fallback. |
| `lib/storage/` | Snapshot read/write, validation, migration, recovery. Plus completion history, rating, recovery log. |
| `lib/copy/` | Centralize copy; tone playful/sarcastic for results. |
| `constants/` | `config.ts` (storage keys, debounce, versions), `design.ts` (colors), `dev.ts` (dev overrides). |

When unsure whether to extract a component, ask or mirror the nearest existing pattern (`components/game/`, `components/grid/`).

### Internationalization (v1.2)

- **Device locale only in release:** `languageCode` starting with `zh` → `zh`, else `en`; missing → `en` (`lib/i18n/resolveLocale.ts`).
- **Strings live in `locales/zh/` and `locales/en/`** — UI (`ui.ts`), copy pools (`copy.ts`), privacy (`privacy.ts`), nonogram titles (`patterns.ts`).
- **UI reads copy via `useI18n()`** — `strings`, `locale`, `appDisplayName`. Do not hardcode user-facing text in components.
- **`lib/copy/*`** — thin locale-param wrappers over `locales/*/copy` (result, rules, streak, share).
- **Dev-only locale preview:** `app/settings.tsx` + `setLocaleOverride` in `I18nProvider` — memory only, no AsyncStorage; stripped in release (`Redirect` to `/`).
- **Tests:** wrap RTL in `renderWithI18n` or `ScreenProviders` with `locale`; add English assertions in `__tests__/lib/i18n/en-smoke.test.ts` when touching copy/share.

### State management

- **Daily game:** `DailyGameContext` + `useDailyGame()`.
- **Ephemeral UI:** local `useState` in screens/components.
- **Persist:** `lib/storage/dailyStorage.ts` with debounce (`PLAY_STATE_DEBOUNCE_MS` in `constants/config.ts`).
- Do not introduce Redux/Zustand without explicit request.

---

## UI & Styling

- Default to **NativeWind v4** `className`.
- Design tokens: `constants/design.ts`, CSS variables in `global.css`, `tailwind.config.js`.
- Match existing tone: minimal, dark-friendly, generous touch targets, soft shadows, clear conflict feedback on Sudoku/Binary (Nonogram validates on complete only).

### When inline `style={{ }}` is OK

This project does **not** use `StyleSheet.create`. Inline styles only in these cases:

| Case | Example in repo |
|------|------------------|
| **Custom fonts** | `fontFamily: 'SpaceMono_400Regular'`, `Inter_400Regular` |
| **Reanimated** | `Animated.View` / `Animated.Text` with `entering` props |
| **Dynamic layout** | `maxWidth`, `alignSelf`, `paddingBottom` from `useSafeAreaInsets()` |
| **Token not in Tailwind** | `backgroundColor: colors.accentSunset`, `borderColor: colors.hairline` |
| **One-off rgba** | abandon banner `rgba(255, 122, 23, 0.12)` in `app/game.tsx` |
| **ActivityIndicator / platform** | Colors from `constants/design.ts` |

Prefer adding a **repeated** pattern to `global.css` (BEM-style utilities) or `tailwind.config.js` over copying inline styles.

### Images & assets

- Centralize image requires in `constants/images.ts` (create when introducing new bundled assets).
- Keep naming consistent under `assets/`. App icons / store assets live under `assets/AppAssets_*`.

---

## Working Principles

- Ship the **smallest change** that meets the requirement; touch only what you must.
- Prefer **duplication over premature abstraction**. Refactor when the same pattern appears 3+ times or a file blocks maintenance.
- Be **concise** in PR descriptions and chat. Explain **what** changed and **why**, with manual test steps for UI work.
- **Ask** before adding dependencies, changing daily determinism, or large refactors.
- Prefer **tests** for puzzle/storage logic; manual QA for UI animations and layout.

Known tech-debt (optional read): `.planning/codebase/CONCERNS.md`.

---

## Feature Implementation Checklist

1. Read this file + skim files you will touch.
2. Identify minimal file set; avoid drive-by refactors.
3. Follow existing patterns (context, storage, grid components).
4. Wire end-to-end: route → context → UI → persistence.
5. Add/update tests: `__tests__/lib/` for puzzle/storage; `__tests__/contexts/` or `__tests__/screens/` for context/UI flows.
6. Verify before claiming done (see *Verification*).
7. Explain changes concisely + manual test steps for UI.

### Storage version bumps

When changing persisted JSON shape:

| Store | Constant | Touch |
|-------|----------|--------|
| Daily snapshot | `STORAGE_VERSION` in `constants/config.ts` | `snapshotValidate.ts`, `snapshotPrep.ts`, `snapshotMigration.ts`, `snapshotLegacy.ts`, golden fixtures in `__tests__/lib/storage/migration/` |
| Streak | `STREAK_STORAGE_VERSION` | `lib/storage/streakStorage.ts`, `__tests__/lib/storage/streakStorage.test.ts` |
| Completion history | `COMPLETION_HISTORY_STORAGE_VERSION` | `lib/storage/completionHistoryStorage.ts`, `backfillCompletionHistory.ts` |
| Rating prompt state | `RATING_STORAGE_VERSION` | `lib/storage/ratingStorage.ts` |

Never bump without migration/read path for existing installs and unit tests for each supported legacy version.

---

## Verification

Run the same checks as CI (`.github/workflows/ci.yml`):

```bash
npm run typecheck       # tsc --noEmit
npm test                # unit + rtl (~298 tests; includes en-smoke)
npm run test:migration  # snapshot migration golden fixtures
npm run lint            # expo lint
npm run lockfile:verify-eas  # npm 10 ci — must pass before EAS build
```

Optional splits:

```bash
npm run test:unit
npm run test:rtl
```

Do not claim verification passed unless **all four** succeed.

For UI changes, include manual steps:

- Fresh install / clear storage → today's puzzle loads
- Kill app mid-game → progress restores
- Complete and surrender → result copy, stats cards, share button (when `playState` valid), streak line on win, animations
- Recovery path → `completed` with stripped `playState` shows outcome but no share button
- Dev panel (`__DEV__`) → force game type / reset today / inject recovery / **settings placeholder** (locale preview)

EAS builds (`eas.json` preview/production profiles) require device verification before tagging release-ready.

---

## Dev Tools (`__DEV__` only)

- `components/dev/DevToolsPanel.tsx` and `constants/dev.ts` are gated by `__DEV__` and stripped from production.
- `DEV_FORCE_GAME_TYPE` overrides daily selection in development only.
- Panel actions: force game type, reset today, inject recovery scenario, clear rating/history, view recovery log, open settings placeholder.

---

## v1 Out of scope (do not expand without approval)

| Out of scope | Notes |
|--------------|--------|
| Auth / backend | `(auth)/login.tsx` is placeholder only |
| Notifications | Defer |
| Hints, full history UI, social, leaderboards | Defer |
| Remote puzzle config | Violates offline-first |
| Heavy date libraries | Use `lib/date/localDay.ts` |
