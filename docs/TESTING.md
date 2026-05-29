<!-- generated-by: gsd-doc-writer -->

# Testing — 傻了么 (Silly Me)

This document describes how tests are organized, how to run them locally, how CI enforces quality gates, and when to use manual QA on device.

## Test framework and setup

The project uses **Jest 29** with a **dual-project** configuration defined in `jest.config.js`:

| Project | Preset | Environment | File pattern | Purpose |
|---------|--------|-------------|--------------|---------|
| `unit` | `ts-jest` | `node` | `**/__tests__/**/*.test.ts` | Pure logic: puzzles, storage, date, copy |
| `rtl` | `jest-expo` | React Native (via jest-expo) | `**/__tests__/**/*.test.tsx` | Components, hooks, contexts, screens |

**Dev dependencies:** `jest`, `jest-expo`, `ts-jest`, `@testing-library/react-native`, `react-test-renderer`, `@types/jest`.

**Setup files:**

- `jest.setup.js` — shared by both projects. Mocks AsyncStorage and Reanimated; sets `global.__DEV__ = true` for unit tests.
- `jest.setup.rtl.js` — RTL-only. Mocks `expo-router`, `localDay` (fixed `dateKey`), safe-area context, and `runAfterInteractions`.

Install dependencies before running tests:

```bash
npm ci   # or npm install for local dev
```

The RTL project runs with `maxWorkers: 1` in Jest config to reduce flakiness. The `test:rtl` script also sets `--testTimeout=20000` for slower screen tests.

## Running tests

Run the full suite (both projects):

```bash
npm test
```

Run projects separately:

```bash
npm run test:unit       # jest --selectProjects unit
npm run test:rtl        # jest --selectProjects rtl --testTimeout=20000
npm run test:migration  # migration golden fixtures under __tests__/lib/storage/migration/
```

Run a single file:

```bash
npm test -- __tests__/lib/puzzles/dailySelector.test.ts
npm test -- __tests__/screens/game.test.tsx
```

Filter by test name:

```bash
npm test -- -t "returns stable gameType"
```

**Related checks** (same bar as CI):

```bash
npm run typecheck      # tsc --noEmit
npm run test:migration # storage migration golden fixtures (also in CI)
npm run lint           # expo lint
```

## `__tests__/` layout

```
__tests__/
├── lib/                    # Unit tests (*.test.ts)
│   ├── puzzles/            # Generators, validators, solvers, dailySelector, dailySelectorSafe, isSolvable
│   ├── storage/            # Snapshot read/write, validation, migration, recover, recoveryLog
│   │   └── migration/      # Golden fixtures (v1→current, v2 snapshots); run via test:migration
│   ├── share/              # buildShareCard
│   ├── stats/              # computeStatsCards, weeklyCompletedCount
│   ├── rating/             # shouldPromptRating, maybePromptAppReview
│   ├── time/               # formatElapsedClock, computeElapsedMs
│   ├── date/               # Local calendar day helpers
│   ├── daily/              # Hydrate/build orchestration
│   ├── streak/             # Streak logic
│   └── copy/               # User-facing string helpers
├── contexts/               # DailyGameContext RTL
├── hooks/                  # useSudokuBoard, useBinaryBoard, useNonogramBoard
├── components/grid/        # SudokuGrid, BinaryGrid, NonogramGrid
├── components/game/        # GameScreenHeader, GameScreenFooter
├── screens/                # index, game, result, privacy
└── helpers/                # Shared fixtures and mocks
    ├── dailyGameFixtures.ts
    ├── expoRouterMocks.ts
    └── screenTestUtils.tsx
```

### Writing new tests

**Unit tests (`.test.ts`):**

- Place under `__tests__/lib/` mirroring the source path (e.g. `lib/puzzles/foo.ts` → `__tests__/lib/puzzles/foo.test.ts`).
- Import from `lib/` with relative paths; no React or RN imports.
- Prefer deterministic inputs (fixed `dateKey`, seeds) for puzzle and daily-selection tests.

**RTL tests (`.test.tsx`):**

- Place under `__tests__/contexts/`, `__tests__/hooks/`, `__tests__/components/`, or `__tests__/screens/` depending on what you are testing.
- Use `@testing-library/react-native` (`render`, `screen`, `fireEvent`, `waitFor`, `act`).
- Wrap screens in `ScreenProviders` from `__tests__/helpers/screenTestUtils.tsx` when `DailyGameContext` or dev UI state is required (`locale` prop defaults to `zh`).
- Use `renderWithI18n` from `__tests__/helpers/renderWithI18n.tsx` for components that only need `I18nTestProvider` (pass `{ locale: 'en' }` for English).
- Use `dailyGameFixtures.ts` for snapshot fixtures and `expoRouterMocks.ts` for navigation assertions.

**What to test where:**

| Layer | Test type | Location |
|-------|-----------|----------|
| Puzzle algorithms, storage, date | Unit | `__tests__/lib/` |
| Context orchestration | RTL | `__tests__/contexts/` |
| Board hooks | RTL | `__tests__/hooks/` |
| Grid components | RTL | `__tests__/components/` |
| Route screens | RTL | `__tests__/screens/` |
| Visual polish, animations, gestures | Manual QA | Device/simulator |

## Coverage requirements

No coverage threshold is configured in `jest.config.js` or CI. Coverage output is not enforced on pull requests.

To generate a local coverage report (optional):

```bash
npm test -- --coverage
```

The `coverage/` directory is gitignored.

## CI integration

Workflow: `.github/workflows/ci.yml` — job **`verify`**

| Trigger | `push` and `pull_request` to `main` or `master` |
|---------|--------------------------------------------------|
| Runner | `ubuntu-latest`, Node.js 22 (from `.nvmrc`), npm 11+ |
| Install | `npm ci` |

Steps (in order):

1. **Typecheck** — `npm run typecheck`
2. **Tests** — `npm test` (runs both `unit` and `rtl` projects; currently ~298 tests)
3. **Migration tests** — `npm run test:migration`
4. **Lint** — `npm run lint`

All four must pass before merging. Locally, run the same commands before claiming a change is done.

## Manual QA checklist

Automated tests cover logic and component behavior; they do not replace on-device checks for layout, animations, and persistence across app restarts. Use this checklist after UI or storage changes:

- [ ] **Fresh install / clear storage** — Open app; today’s puzzle loads with correct type (Sudoku, Binary, or Nonogram) for the local day.
- [ ] **Mid-game persistence** — Fill some cells, kill the app, reopen; progress and timer restore.
- [ ] **Complete flow** — Finish today’s puzzle; result screen shows copy, three stats cards, share button (if `playState` valid), and animations.
- [ ] **Share card** — Tap「拷贝战报」; clipboard contains emoji grid + timing/streak line.
- [ ] **Surrender flow** — Abandon from game screen; result screen reflects surrender state (no streak check-in).
- [ ] **Recovery** — Dev「注入坏盘面」→ kill app → reopen; outcome preserved, share hidden if board stripped.
- [ ] **Conflict feedback** — Enter invalid Sudoku/Binary values; conflict highlighting appears as expected. (Nonogram has no mid-game conflict UI; complete validates against the hidden solution.)
- [ ] **Nonogram complete** — Finish a nonogram day; result screen shows pattern reveal card with correct title.
- [ ] **Rules modal** — Open in-game rules; content matches current game type.
- [ ] **Streak (if applicable)** — Win on consecutive days; streak count and copy update; skip a day resets as designed.
- [ ] **Dev panel (`__DEV__` only)** — Force game type / reset today / inject recovery / clear logs; open **设置占位** to preview en/zh (not persisted); confirm no dev shortcuts affect release builds.
- [ ] **English locale** — Set device language to English (or DevTools settings preview); game/result/privacy strings show **Silly Me** branding; share CTA uses `#SillyMe`.

Start the dev server for manual testing:

```bash
npm start
# or: npx expo start
```

For release confidence, also verify on at least one iOS and one Android device or simulator before shipping store builds (see `eas.json` profiles).
