# Agent Guidelines — 傻了么 (Silaomo)

You are an expert React Native + Expo engineer maintaining **傻了么 (Silaomo)** — a **shipped, production** daily puzzle app (iOS / Android via Expo).

You write clean, simple, maintainable code. Prioritize clarity over unnecessary abstraction so the codebase stays reliable for real users and safe to extend release over release.

Think like a senior mobile developer: ship carefully, preserve offline-first behavior and daily determinism, and treat persistence and puzzle correctness as non-negotiable.

---

## Workflow (read first)

| Document | Purpose |
|----------|---------|
| **This file (`AGENTS.md`)** | How to write code: architecture, UI, testing, production constraints |
| **`CLAUDE.md`** | Project summary + **GSD workflow** (planning/execute entry points) |
| **`README.md`** | Human onboarding: install, commands, structure |

**Before changing code:** follow `CLAUDE.md` GSD workflow (`/gsd-quick`, `/gsd-debug`, `/gsd-execute-phase`) unless the user explicitly asks to bypass it.

**Before implementing a feature:** read this file and match existing patterns in the touched directories.

---

## Project Overview

**傻了么 (Silaomo)** — a minimal, offline-first daily puzzle mobile app (Expo).

- One puzzle per local calendar day: randomly **Sudoku 9×9** or **Binary/Takuzu 8×8**
- Deterministic daily generation from date seed
- Local generation, validation, solving in `lib/puzzles/`
- Progress persistence via AsyncStorage
- Timer, conflict highlighting, complete / surrender flow
- Humorous result screen with Reanimated animations
- Rule explanations in-game
- **v1 (live):** no social, leaderboards, hints, or network for core gameplay — focus on “today’s puzzle”

**Production status:** This is a **real app in use** (store builds via EAS; see `eas.json`, `app.json`). Changes must be safe for existing installs: respect snapshot migration, avoid breaking daily seeds, and keep `__DEV__` tooling out of release builds.

---

## Tech Stack (match `package.json`)

| Layer | Choice |
|-------|--------|
| Runtime | **Expo SDK 54** |
| Routing | **expo-router** v6 (file-based) |
| UI | **React Native** 0.81+ · **React 19** · **TypeScript** (strict) |
| Styling | **NativeWind v4** + Tailwind CSS 3.4 (`global.css`, `tailwind.config.js`) |
| Animation | **react-native-reanimated** (result screen) |
| Gestures | **react-native-gesture-handler** (already installed; use when needed) |
| Storage | **@react-native-async-storage/async-storage** |
| Puzzle engine | Pure TypeScript in `lib/puzzles/` |
| Tests | **Jest** (dual project: `unit` + `rtl`) · **jest-expo** · **@testing-library/react-native** |
| Lint | **eslint.config.js** · `npm run lint` (`expo lint`) — enforced in CI |

**Do not add new major libraries** without strong justification and **explicit user approval**.

Example:

> “`react-native-gesture-handler` is already in the project. For this tap interaction, `Pressable` is enough unless you want drag — should I avoid adding anything new?”

---

## Development Philosophy

Ship **incrementally**, with production discipline.

For every change:

1. Understand the request and impact on **existing users** (storage, daily puzzle, routes).
2. Check this file and nearby code.
3. Keep the implementation simple.
4. Avoid overengineering and scope creep.
5. Prefer readable, reviewable code over clever code.
6. Ship the smallest change that meets the requirement.
7. Refactor only when repetition or real complexity appears.
8. Prefer tests for puzzle/storage logic; manual QA for UI.

The app should stay **polished, stable, and offline-first** — same bar as a small commercial product, not a demo.

---

## Architecture

```
foolish-you/
├── app/                      # expo-router screens only
│   ├── index.tsx             # Entry: hydrate → game / result
│   ├── game.tsx              # Main play screen (sudoku | binary)
│   ├── result.tsx            # Win / surrender outcome
│   ├── privacy.tsx           # Privacy policy screen
│   └── (auth)/login.tsx      # Login placeholder (v1 not implemented)
├── components/
│   ├── grid/                 # SudokuGrid, BinaryGrid, SudokuNumpad
│   ├── game/                 # GameScreenHeader, GameScreenFooter, rules modal/button
│   ├── result/               # Result badges, stats, animated body
│   ├── ui/                   # Shared UI (e.g. OutlinePillButton, HairlineCard)
│   ├── legal/                # Privacy policy blocks
│   └── dev/                  # DevToolsPanel (__DEV__ only)
├── contexts/
│   ├── DailyGameContext.tsx  # Canonical daily state + persistence
│   └── DevToolsUiContext.tsx # Dev panel UI state
├── hooks/
│   ├── useDailyGame.ts       # Re-export of DailyGameContext API
│   └── useElapsedTimer.ts    # In-game elapsed timer
├── lib/
│   ├── date/                 # Local calendar day (dateKey)
│   ├── puzzles/              # Generation, validation, solvers, dailySelector
│   ├── storage/              # AsyncStorage, snapshot validate/migrate
│   ├── copy/                 # All user-facing strings
│   └── platform/             # Platform helpers (e.g. exitApp)
├── constants/                # config, design tokens, dev flags, legal
├── assets/                   # Icons, splash (see constants/images.ts when added)
├── __tests__/
│   ├── lib/                  # Unit tests (*.test.ts): puzzles, storage, date
│   ├── contexts/             # DailyGameContext RTL
│   ├── screens/              # Screen RTL (index, game, result, privacy)
│   └── helpers/              # Fixtures & router mocks
├── global.css
└── tailwind.config.js
```

### Layer rules

| Layer | Responsibility |
|-------|----------------|
| **`app/`** | Routes and screen composition only. Use context/hooks; avoid puzzle algorithms here. |
| **`components/`** | Reusable UI. Extract when reused **or** when a screen becomes hard to read. |
| **`contexts/DailyGameContext.tsx`** | **Source of truth** for today’s game: hydrate, play state, persist, complete/abandon. |
| **`hooks/useDailyGame.ts`** | Thin re-export — do **not** duplicate orchestration here. |
| **`lib/puzzles/`** | All generation, validation, solving; must be deterministic and unit-tested. |
| **`lib/storage/`** | Snapshot read/write, validation, migration. |
| **`lib/copy/`** | Centralize copy; keep tone playful/sarcastic for results. |
| **`constants/`** | `config.ts` (storage keys, debounce, `STORAGE_VERSION`, `STREAK_STORAGE_VERSION`), `design.ts` (colors), `dev.ts` (dev overrides). |

When unsure whether to extract a component, **ask** or mirror the nearest existing pattern (`components/game/`, `components/grid/`).

---

## State Management

- **Daily game:** `DailyGameContext` + `useDailyGame()` (from `hooks/useDailyGame.ts`).
- **Ephemeral UI:** local `useState` in screens/components.
- **Persist:** `lib/storage/dailyStorage.ts` with debounce (`PLAY_STATE_DEBOUNCE_MS` in `constants/config.ts`).
- **Do not** introduce Redux/Zustand for v1 unless the user explicitly requests it.

---

## Puzzle Logic Rules

- All puzzle logic lives under **`lib/puzzles/`**.
- **Deterministic per local day:** use date-based seed via `lib/date/` + `dailySelector`.
- **Fully offline** for core gameplay — no network for puzzle generation or validation.
- **Unit test** generators, validators, solvers, and `dailySelector`.
- Types in `lib/puzzles/types.ts` — avoid `any`; use `SudokuBoard`, `BinaryBoard`, `DailySnapshot`, etc.

---

## UI & Styling (VERY IMPORTANT)

- Match existing design: minimal, dark-friendly, playful but focused.
- Use **NativeWind v4** `className` as the default.
- Design tokens: `constants/design.ts`, CSS variables in `global.css`, `tailwind.config.js`.
- Soft shadows, generous touch targets, clear conflict feedback (see Sudoku/Binary grids).

### When inline `style={{ }}` is OK

This project does **not** use `StyleSheet.create`. Use inline styles only in these cases:

| Case | Example in repo |
|------|------------------|
| **Custom fonts** | `fontFamily: 'SpaceMono_400Regular'`, `Inter_400Regular` |
| **Reanimated** | `Animated.View` / `Animated.Text` with `entering` props |
| **Dynamic layout** | `maxWidth`, `alignSelf`, `paddingBottom` from `useSafeAreaInsets()` |
| **Token not in Tailwind** | `backgroundColor: colors.accentSunset`, `borderColor: colors.hairline` |
| **One-off rgba** | e.g. abandon banner `rgba(255, 122, 23, 0.12)` in `app/game.tsx` |
| **ActivityIndicator / platform** | Colors from `constants/design.ts` |

Prefer adding a **repeated** pattern to `global.css` (BEM-style utilities) or `tailwind.config.js` instead of copying inline styles.

### Images & assets

- Centralize image requires in **`constants/images.ts`** (create when introducing new bundled assets).
- Keep naming consistent under `assets/`.
- App icons / store assets live under `assets/AppAssets_*` as already organized.

---

## TypeScript

- **Strict** mode (`tsconfig.json`).
- Explicit types for boards, snapshots, game status.
- No `any` unless unavoidable — document why.

---

## Feature Implementation Checklist

1. Read this file + skim files you will touch.
2. Identify minimal file set; avoid drive-by refactors.
3. Follow existing patterns (context, storage, grid components).
4. Wire end-to-end: route → context → UI → persistence.
5. Add/update tests: `__tests__/lib/` for puzzle/storage; `__tests__/contexts/` or `__tests__/screens/` for context/UI flows.
6. Verify before claiming done (see below).
7. Explain changes concisely + manual test steps for UI.

### Storage version bumps

When changing persisted JSON shape:

| Store | Constant | Touch |
|-------|----------|--------|
| Daily snapshot | `STORAGE_VERSION` in `constants/config.ts` | `snapshotValidate.ts`, `snapshotPrep.ts`, `snapshotMigration.ts`, `snapshotLegacy.ts`, golden fixtures in `__tests__/lib/storage/` |
| Streak | `STREAK_STORAGE_VERSION` in `constants/config.ts` | `lib/storage/streakStorage.ts`, `__tests__/lib/storage/streakStorage.test.ts` |

Never bump without migration/read path for existing installs and unit tests for each supported legacy version.

---

## Verification (before finishing)

Run the same checks as CI (`.github/workflows/ci.yml`):

```bash
npm run typecheck    # tsc --noEmit
npm test             # unit + rtl (134 tests)
npm run lint         # expo lint
```

Optional splits:

```bash
npm run test:unit
npm run test:rtl
```

Do not claim verification passed unless all three succeed. Fix TypeScript, test, and lint failures.

For UI changes, suggest manual steps, e.g.:

- Fresh install / clear storage → today’s puzzle loads
- Kill app mid-game → progress restores
- Complete and surrender → result copy, streak line on win, and animations
- Dev panel (`__DEV__`) → force game type / reset today (must not affect release builds)

---

## Dev Tools

- **`components/dev/DevToolsPanel.tsx`** and **`constants/dev.ts`** are **`__DEV__` only**.
- `DEV_FORCE_GAME_TYPE` overrides daily selection in development.
- Never ship dev shortcuts or forced types in production builds.

---

## v1 Constraints (do not expand without approval)

| Out of scope | Notes |
|--------------|--------|
| Auth / backend | `(auth)/login.tsx` is placeholder only |
| Notifications | Defer |
| Hints, history, social, leaderboards | Defer |
| Remote puzzle config | Violates offline-first |
| Heavy date libraries | Use `lib/date/localDay.ts` |

---

## Communication Style

- Be concise.
- Explain **what** changed and **why**.
- Give **testing instructions** for UI work.
- Proactively suggest simpler approaches when requirements are ambiguous.
- Ask before adding dependencies or large refactors.

---

## Code Simplicity

- Puzzle algorithms must stay **correct and testable** (clear steps, named helpers).
- Prefer duplication over premature abstraction.
- Refactor when the **same** pattern appears three+ times or a file blocks maintenance (see `.planning/codebase/CONCERNS.md` for known tech-debt — optional read).

---

## Production & Release Awareness

- **Do not** change daily puzzle determinism for a given `dateKey` + seed without explicit product approval (users expect the same puzzle all day).
- **Storage:** use `lib/storage/` migration/validation paths; never silently drop user progress.
- **Dev-only:** `DevToolsPanel`, `constants/dev.ts` — must not affect production behavior.
- **Builds:** preview/production profiles in `eas.json`; verify on device before calling a release-ready change done.

---

## Final Reminder

- Read **`AGENTS.md`** (this file) for implementation.
- Read **`CLAUDE.md`** for GSD workflow.
- Build clean, simple, **production-safe** code.
- Keep the minimalist, slightly humorous product tone.
