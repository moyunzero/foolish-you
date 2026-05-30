<!-- generated-by: gsd-doc-writer -->

# Development — 傻了么 (Brainfool)

How to work on this codebase day to day: local setup, verification commands, code layout, and development-only tooling. For install and first run, see [README.md](../README.md). For env and build profiles, see [CONFIGURATION.md](./CONFIGURATION.md). For architecture and data flow, see [ARCHITECTURE.md](./ARCHITECTURE.md).

**Implementation conventions (required reading for contributors and agents):** [AGENTS.md](../AGENTS.md) — architecture layers, UI rules, testing expectations, production constraints (offline-first, daily determinism, storage migration).

---

## Local setup

1. **Prerequisites:** Node.js 22 LTS + npm 11+ (same as CI; see repo `.nvmrc`). iOS/Android tooling or Expo Go as described in the README.
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

**Dependency / lockfile changes:** EAS Build installs with **npm 10**; local Node 22 often ships **npm 11**. After adding or upgrading packages, regenerate the lockfile with npm 10 so EAS `npm ci` stays in sync:

```bash
npm run lockfile:sync    # npx npm@10.9.2 install
npm run lockfile:verify-eas
```

Commit the updated `package-lock.json` with your dependency change. CI runs `lockfile:verify-eas` on every push.

---

## Verification workflow

Before opening a PR or calling a change done, run the same checks as [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

```bash
npm run typecheck      # tsc --noEmit (strict)
npm test               # Jest: unit + rtl projects (~298 tests)
npm run test:migration # snapshot migration golden fixtures only
npm run lint           # expo lint (ESLint flat config)
```

| Command | What it runs |
|---------|----------------|
| `npm run typecheck` | TypeScript `tsc --noEmit` (`tsconfig.json` extends `expo/tsconfig.base`, `strict: true`) |
| `npm test` | Full Jest suite (both projects below) |
| `npm run test:migration` | `jest --selectProjects unit --testPathPattern=__tests__/lib/storage/migration` |
| `npm run test:unit` | `jest --selectProjects unit` — `**/__tests__/**/*.test.ts` in Node |
| `npm run test:rtl` | `jest --selectProjects rtl` — `**/__tests__/**/*.test.tsx` with jest-expo (20s timeout) |
| `npm run lint` | `expo lint` → ESLint via [`eslint.config.js`](../eslint.config.js) (`eslint-config-expo` flat preset) |

**When to split tests:** Use `test:unit` for puzzle/storage/date logic; use `test:rtl` for screens and `DailyGameContext` when iterating on UI. RTL runs with `maxWorkers: 1` in [`jest.config.js`](../jest.config.js).

**CI order:** typecheck → `npm test` → `test:migration` → lint (on push/PR to `main` / `master`).

---

## Frontend code review

Follows the [frontend-pull-request-checklist](https://github.com/sapegin/frontend-pull-request-checklist) pattern: **automated checks + structured human/agent review** before merge.

### Skill locations

| Layer | Path |
|-------|------|
| Project skill | `.cursor/skills/frontend-code-review/SKILL.md` |
| Project rules | `.cursor/skills/frontend-code-review/references/project.md` |
| Global checklist | `~/.cursor/skills/frontend-code-review/` |

Full policy: [AGENTS.md § Frontend code review](../AGENTS.md#frontend-code-review).

### When to run

1. **After GSD plan / phase execution** — agent reviews all touched frontend files (Template A/B in skill).
2. **Before `git push` or opening a PR** — same review; urgent issues must be fixed first.

Frontend paths: `app/`, `components/`, `hooks/`, `contexts/`, `locales/`, `global.css`, `tailwind.config.js`.

### Local git hook

One-time per clone:

```bash
npm run hooks:install   # git config core.hooksPath .githooks
```

`pre-push` runs `scripts/frontend-review-gate.sh`: prints changed frontend files, runs `typecheck` + `lint`.

Optional strict mode (block push until you confirm CR):

```bash
FRONTEND_CR_STRICT=1 FRONTEND_CR_DONE=1 git push
```

Preview gate without pushing:

```bash
npm run frontend:review-gate
```

### Cursor hooks (IDE)

[`.cursor/hooks.json`](../.cursor/hooks.json):

- **`stop`** — nudges agent to run frontend-code-review when UI files remain in the working tree after a turn.
- **`beforeShellExecution`** (`git push`) — asks to confirm review unless `FRONTEND_CR_DONE=1`.

Reload Cursor or save `hooks.json` after pull if hooks do not fire.

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
│   ├── grid/                 # SudokuGrid, BinaryGrid, NonogramGrid, numpad
│   ├── game/                 # Game sections, header/footer, rules UI
│   ├── result/               # Result badges, stats, NonogramRevealCard, animations
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
│   ├── puzzles/              # Generation, validation, solvers, dailySelectorSafe
│   ├── storage/              # AsyncStorage, validate/migrate/recover, history, rating
│   ├── share/                # Emoji share card builder
│   ├── stats/                # Result stats cards
│   ├── rating/               # App Store review gating
│   ├── time/                 # Elapsed ms + clock formatting
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
| `DEV_FORCE_GAME_TYPE` | `'sudoku'` \| `'binary'` \| `'nonogram'` \| `null` — force type when creating a **new** today snapshot; `null` = date-seed random (production behavior) |
| `getDevForceGameType()` | Returns `null` outside `__DEV__` even if the constant is set |

Used by [`lib/daily/dailyHydrate.ts`](../lib/daily/dailyHydrate.ts) when hydrating or regenerating today’s game. Changing `DEV_FORCE_GAME_TYPE` alone does not rewrite an existing saved snapshot until you reset today (dev panel or clear storage).

### `DevToolsPanel` (`components/dev/DevToolsPanel.tsx`)

Rendered from [`app/_layout.tsx`](../app/_layout.tsx) only when `DEV_TOOLS_ENABLED` is true, inside `DevToolsUiProvider`.

**Capabilities (expanded panel):**

- Show `dateKey`, `gameType`, status, puzzle hash (and Sudoku hash when applicable)
- **数独 / 二进制 / 数绘 / 自然随机 / 重开今日** — regenerate today via `devRegenerateToday` and navigate to `/game`
- **弹出评分** — call `requestAppStoreReview()` directly (bypasses gates)
- **重置通关记录** / **重置评分** — clear completion history or rating prompt state
- **注入坏盘面** — write `completed` + empty `playState` to exercise `recoverSnapshot` on next load
- **清恢复日志** — clear `@foolish-you/snapshot-recovery-log-v1`; recent entries shown when expanded
- **隐藏** — hide the bottom bar for screenshots (preference persisted in AsyncStorage)

**Bar visibility:** [`contexts/DevToolsUiContext.tsx`](../contexts/DevToolsUiContext.tsx) stores `@foolish-you/dev-tools-bar-visible`. Long-press the footer **隐私政策** link ([`PrivacyPolicyFooterLink`](../components/legal/PrivacyPolicyFooterLink.tsx)) to toggle the bar back. Game/result/privacy screens use `useDevBottomInset()` so content clears the bar when visible.

### Manual QA checklist (UI changes)

- Fresh install or cleared storage → today’s puzzle loads
- Kill app mid-game → progress restores
- Complete and surrender → result copy, stats cards, share button (when `playState` present), animations
- Recovery path: inject bad snapshot → restart → result without share button but outcome preserved
- Dev panel: force game type / reset today / rating & history resets — confirm no effect on release builds

---

## Branch and PR conventions

- **Default branch:** `main` (CI also accepts `master`).
- **Branch naming:** No documented convention in the repo; use clear prefixes (e.g. `feat/`, `fix/`) if your team agrees.
- **Pull requests:** No `CONTRIBUTING.md` or PR template in `.github/` yet. For each PR:
  - Run `typecheck`, `npm test`, `test:migration`, and `lint`
  - Run **frontend-code-review** on UI-touched files (see above)
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
