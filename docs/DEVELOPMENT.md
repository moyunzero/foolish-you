<!-- generated-by: gsd-doc-writer -->

# Development — 傻了么 (Silaomo)

How to work on this codebase day to day: local setup, verification commands, code layout, and development-only tooling. For install and first run, see [README.md](../README.md). For env and build profiles, see [CONFIGURATION.md](./CONFIGURATION.md). For architecture and data flow, see [ARCHITECTURE.md](./ARCHITECTURE.md).

**Implementation conventions (required reading for contributors and agents):** [AGENTS.md](../AGENTS.md) — architecture layers, UI rules, testing expectations, production constraints (offline-first, daily determinism, storage migration).

---

## Local setup

1. **Prerequisites:** Node.js 20 LTS+, npm 10+ (CI uses Node 20). iOS/Android tooling or Expo Go as described in the README.
2. **Clone and install:**
   ```bash
   git clone https://github.com/moyunzero/foolish-you.git
   cd foolish-you
   npm install
   ```
3. **Start the dev server:**
   ```bash
   npm start
   ```
   Press `i` / `a` for simulators, or scan with Expo Go. After changing Babel/Reanimated or native deps, clear cache: `npx expo start -c`.
4. **Optional env:** Copy `.env.example` to `.env.local` only if you add `EXPO_PUBLIC_*` overrides (see CONFIGURATION.md). Core gameplay needs no env vars.

Use `npm install` (not `npm ci`) for day-to-day work unless you are reproducing CI exactly.

---

## Verification workflow

Before opening a PR or calling a change done, run the same checks as [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

```bash
npm run typecheck   # tsc --noEmit (strict)
npm test            # Jest: unit + rtl projects
npm run lint        # expo lint (ESLint flat config)
```

| Command | What it runs |
|---------|----------------|
| `npm run typecheck` | TypeScript `tsc --noEmit` (`tsconfig.json` extends `expo/tsconfig.base`, `strict: true`) |
| `npm test` | Full Jest suite (both projects below) |
| `npm run test:unit` | `jest --selectProjects unit` — `**/__tests__/**/*.test.ts` in Node |
| `npm run test:rtl` | `jest --selectProjects rtl` — `**/__tests__/**/*.test.tsx` with jest-expo (20s timeout) |
| `npm run lint` | `expo lint` → ESLint via [`eslint.config.js`](../eslint.config.js) (`eslint-config-expo` flat preset) |

**When to split tests:** Use `test:unit` for puzzle/storage/date logic; use `test:rtl` for screens and `DailyGameContext` when iterating on UI. RTL runs with `maxWorkers: 1` in [`jest.config.js`](../jest.config.js).

**CI order:** typecheck → `npm test` → lint (on push/PR to `main` / `master`).

---

## Build and platform commands

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run ios` | `expo run:ios` (simulator/device; needs dev client or prebuild) |
| `npm run android` | `expo run:android` |
| `npm run web` | `expo start --web` (secondary target) |
| `npm run build:preview:android` | EAS build, Android `preview` profile |
| `npm run build:preview:ios` | EAS build, iOS `preview` profile |
| `npm run build:production` | EAS build, all platforms `production` profile |

EAS profiles and signing are documented in CONFIGURATION.md and `eas.json`.

---

## Code layout

High-level map (detail and layer rules in AGENTS.md):

```
foolish-you/
├── app/                      # expo-router screens only (no puzzle algorithms)
├── components/
│   ├── grid/                 # SudokuGrid, BinaryGrid, numpad
│   ├── game/                 # Game sections, header/footer, rules UI
│   ├── result/               # Result badges, stats, animations
│   ├── ui/                   # Shared primitives
│   ├── legal/                # Privacy blocks
│   └── dev/                  # DevToolsPanel (__DEV__ only)
├── contexts/
│   ├── DailyGameContext.tsx  # Today's game: hydrate, play, persist, complete/abandon
│   └── DevToolsUiContext.tsx # Dev bar visibility + bottom inset
├── hooks/                    # useDailyGame (re-export), useElapsedTimer
├── lib/
│   ├── date/                 # Local calendar day (dateKey)
│   ├── daily/                # Hydrate/build orchestration (non-React)
│   ├── puzzles/              # Generation, validation, solvers, dailySelector
│   ├── storage/              # AsyncStorage, snapshot validate/migrate
│   ├── streak/               # Consecutive-day streak logic + storage
│   ├── copy/                 # User-facing strings
│   └── platform/             # e.g. exitApp
├── constants/                # config, design tokens, dev flags, legal
├── __tests__/
│   ├── lib/                  # Unit tests (*.test.ts)
│   ├── contexts/             # Context RTL
│   ├── screens/              # Screen RTL
│   └── helpers/              # Fixtures, router mocks
├── global.css                # NativeWind / CSS variables
└── tailwind.config.js
```

**Where to put new code**

| Change | Location |
|--------|----------|
| New route or screen composition | `app/` |
| Reusable UI | `components/` (match `grid/`, `game/`, etc.) |
| Daily state or persistence API | `contexts/DailyGameContext.tsx` + `lib/storage/` |
| Puzzle or daily selection logic | `lib/puzzles/`, `lib/daily/` (unit-test heavily) |
| Copy / tone | `lib/copy/` |
| Storage keys, debounce, feature flags | `constants/config.ts`, `constants/dev.ts` |

---

## Code style

- **Lint:** ESLint 9 flat config in `eslint.config.js` with `eslint-config-expo`. Run `npm run lint` before pushing; CI fails on lint errors.
- **Format:** No dedicated Prettier script in `package.json`; match existing file style (NativeWind `className`, inline `style` only where AGENTS.md allows).
- **TypeScript:** Strict mode; explicit types for boards, snapshots, game status; avoid `any`.

---

## Development-only tooling (`__DEV__`)

Dev features are gated by React Native’s `__DEV__` and [`constants/dev.ts`](../constants/dev.ts). **Release builds must not rely on or ship dev shortcuts** (see AGENTS.md).

### `constants/dev.ts`

| Export | Role |
|--------|------|
| `DEV_TOOLS_ENABLED` | `__DEV__` — enables dev UI |
| `DEV_TOOLS_BAR_HIDDEN_DEFAULT` | Initial visibility of bottom dev bar (`false` = visible on launch) |
| `DEV_FORCE_GAME_TYPE` | `'sudoku'` \| `'binary'` \| `null` — force type when creating a **new** today snapshot; `null` = date-seed random (production behavior) |
| `getDevForceGameType()` | Returns `null` outside `__DEV__` even if the constant is set |

Used by [`lib/daily/dailyHydrate.ts`](../lib/daily/dailyHydrate.ts) when hydrating or regenerating today’s game. Changing `DEV_FORCE_GAME_TYPE` alone does not rewrite an existing saved snapshot until you reset today (dev panel or clear storage).

### `DevToolsPanel` (`components/dev/DevToolsPanel.tsx`)

Rendered from [`app/_layout.tsx`](../app/_layout.tsx) only when `DEV_TOOLS_ENABLED` is true, inside `DevToolsUiProvider`.

**Capabilities (expanded panel):**

- Show `dateKey`, `gameType`, status, puzzle hash (and Sudoku hash when applicable)
- **数独 / 二进制 / 自然随机 / 重开今日** — regenerate today via `devRegenerateToday` and navigate to `/game`
- **隐藏** — hide the bottom bar for screenshots (preference persisted in AsyncStorage)

**Bar visibility:** [`contexts/DevToolsUiContext.tsx`](../contexts/DevToolsUiContext.tsx) stores `@foolish-you/dev-tools-bar-visible`. Long-press the footer **隐私政策** link ([`PrivacyPolicyFooterLink`](../components/legal/PrivacyPolicyFooterLink.tsx)) to toggle the bar back. Game/result/privacy screens use `useDevBottomInset()` so content clears the bar when visible.

### Manual QA checklist (UI changes)

- Fresh install or cleared storage → today’s puzzle loads
- Kill app mid-game → progress restores
- Complete and surrender → result copy and animations
- Dev panel: force game type / reset today — confirm behavior matches intent and does not affect release builds

---

## Branch and PR conventions

- **Default branch:** `main` (CI also accepts `master`).
- **Branch naming:** No documented convention in the repo; use clear prefixes (e.g. `feat/`, `fix/`) if your team agrees.
- **Pull requests:** No `CONTRIBUTING.md` or PR template in `.github/` yet. For each PR:
  - Run `typecheck`, `npm test`, and `lint`
  - Describe impact on **existing users** (storage, daily seed, routes) when relevant
  - Note manual device QA for UI-only changes
  - Avoid changing daily puzzle determinism for a given `dateKey` without explicit product approval

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](../AGENTS.md) | How to implement: layers, UI, tests, production rules |
| [README.md](../README.md) | Onboarding, features, quick start |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Components, data flow, diagrams |
| [CONFIGURATION.md](./CONFIGURATION.md) | App config, EAS, dev constants reference |
| [CLAUDE.md](../CLAUDE.md) | GSD workflow entry points (planning agents) |
