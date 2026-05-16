# Technology Stack

**Project:** 傻了么 (Silaomo) — daily Sudoku + Binary Puzzle mobile app  
**Researched:** 2026-05-16  
**Mode:** Ecosystem / greenfield stack  
**Overall confidence:** **HIGH** for core Expo choices; **MEDIUM** for exact patch versions (always run `npx expo install --fix` after init)

> 产品约束回顾：离线优先、无后端、每日确定性种子、Expo 单代码库 iOS/Android。技术选型必须服务「今天这一局」的极简循环，而不是为未来社交/账号过早买单。

---

## Executive Recommendation

**Use Expo managed workflow + TypeScript + expo-router + NativeWind v4 + Reanimated 4 + AsyncStorage + pure TypeScript puzzle engines.**

| Decision | Recommendation | Why |
|----------|----------------|-----|
| **Expo SDK** | **SDK 55** (greenfield) *or* **SDK 54** (if you must use store Expo Go daily) | SDK 55 = RN 0.83, React 19.2, New Architecture only ([Expo SDK 55 changelog](https://expo.dev/changelog/sdk-55)). SDK 54 still default on Expo Go during early 2026 transition. |
| **Dev workflow** | **Development build** (`expo-dev-client`) for SDK 55 | Expo Go on App Store may lag SDK 55; dev builds match production native stack. |
| **Routing** | **expo-router** ~6.x (bundled with SDK) | File routes for `index` / `game` / `result`; deep links free. |
| **Styling** | **NativeWind 4.1–4.2** + **Tailwind CSS 3.4.x** | Matches PROJECT.md; fast grid/result UI without a second design system. |
| **Animation** | **react-native-reanimated 4.x** + **react-native-worklets** | Result-screen emotion; SDK 55 uses Reanimated 4 on New Architecture. |
| **Persistence** | **@react-native-async-storage/async-storage** | One JSON blob per day is enough for MVP. |
| **State** | **Zustand 5** *or* **React Context** for MVP | Zustand if you want `persist` without provider boilerplate; Context is fine for 3 screens. |
| **Puzzles** | **Custom pure TS** in `lib/puzzles/` | Daily seed + both game types + offline + no npm puzzle coupling. |

---

## Recommended Stack (Pinned Targets)

Pin exact versions with `npx expo install` after project creation. Numbers below are **targets as of research date** — Expo resolves compatible minors.

### Core Framework

| Technology | Target version | Purpose | Why this choice |
|------------|----------------|---------|-----------------|
| **expo** | **~55.0.0** (or ~54.0.0) | App runtime, modules, build | Official cross-platform path; EAS Update for solo maintainer. |
| **react-native** | **0.83.x** (SDK 55) / **0.81.x** (SDK 54) | Native UI | Bundled per SDK; do not pin manually. |
| **react** | **19.2.x** (SDK 55) / **19.1.x** (SDK 54) | UI library | Bundled per SDK. |
| **typescript** | **~5.8.x** | Type safety | Strict mode for puzzle invariants (`Grid`, `Cell`). |
| **Node.js** | **≥ 20.19** | Tooling | [Expo SDK 55 requires Node 20.19+](https://docs.expo.dev/versions/latest/). |

### Navigation & App Shell

| Technology | Target version | Purpose | Why |
|------------|----------------|---------|-----|
| **expo-router** | **~6.0.x** (SDK 55) | File-based routing | Default in modern templates; `Stack` for home → game → result. |
| **react-native-screens** | Expo-pinned | Native screen containers | Peer of expo-router. |
| **react-native-safe-area-context** | Expo-pinned | Safe areas | Notch / home indicator on result screen. |
| **expo-linking** | Expo-pinned | Deep links | Future share/deep link without refactor. |
| **expo-constants** | Expo-pinned | App metadata | Version display, env. |
| **expo-splash-screen** | Expo-pinned | Launch UX | Hide after fonts/assets load. |
| **expo-status-bar** | Expo-pinned | Status bar styling | Match NativeWind theme. |

### UI, Motion, Input

| Technology | Target version | Purpose | Why |
|------------|----------------|---------|-----|
| **nativewind** | **^4.1.23 – ^4.2.0** (stable v4) | Tailwind for RN | PROJECT.md choice; build-time styles, good DX for grids. |
| **tailwindcss** | **^3.4.17** | Design tokens | **Required: v3** for NativeWind v4 (not Tailwind v4). |
| **react-native-css-interop** | Transitive (NativeWind) | CSS interop layer | Do not install a conflicting version manually. |
| **react-native-reanimated** | **~4.3.x** (via `expo install`) | Result animations | Confetti, shake, fade — UI thread. |
| **react-native-worklets** | **~0.8.x** | Reanimated 4 Babel plugin | Separate package in Reanimated 4; Expo 55 often auto-configures via `babel-preset-expo`. |
| **react-native-gesture-handler** | Expo-pinned | Touch / gestures | Grid cell taps; peer of Reanimated. |
| **@expo/vector-icons** | Expo-pinned | Icons | Optional UI chrome; zero extra native setup. |
| **expo-haptics** | Expo-pinned | Tactile feedback | Light impact on complete/invalid move (optional polish). |

### State & Storage

| Technology | Target version | Purpose | Why |
|------------|----------------|---------|-----|
| **@react-native-async-storage/async-storage** | **~2.1.x** (Expo-pinned) | Daily progress JSON | [Official Expo install path](https://docs.expo.dev/versions/latest/); sufficient for one record/day. |
| **zustand** | **^5.0.13** | Global game state (optional) | Tiny; `persist` middleware + AsyncStorage adapter when you outgrow Context. |
| **expo-secure-store** | Expo-pinned | **v2+ only — stub** | Reserve for tokens; not used in v1 guest mode. |

### Puzzle & Daily Logic (Pure TypeScript — No Runtime npm)

| Module | Location | Purpose | Why pure TS |
|--------|----------|---------|-------------|
| **Seeded PRNG** | `lib/daily/seed.ts` | `mulberry32` / xoshiro from date + salt | Deterministic daily game + type without server. |
| **Daily selector** | `lib/daily/dailySelector.ts` | Sudoku vs Binary from seed | Product rule: user cannot pick type. |
| **Sudoku engine** | `lib/puzzles/sudoku/` | Generate, validate, solve | Backtracking + uniqueness check; 9×9 is instant on device. |
| **Binary engine** | `lib/puzzles/binary/` | Takuzu/Binairo rules | No mature TS lib with your daily-seed contract; 6×6–14×14 is feasible in JS. |
| **Date helpers** | `lib/date/localDay.ts` | Calendar day in user TZ | `Intl` + small helpers; avoid shipping full `date-fns` unless you need many formatters. |

**Optional dev-only:** `fast-check` or property tests for puzzle invariants — not shipped to app.

### Testing & Quality

| Technology | Target version | Purpose | Why |
|------------|----------------|---------|-----|
| **jest** | **~29.7** | Unit tests | Puzzle logic must be testable in Node without RN. |
| **jest-expo** | **~55.0.x** (match SDK) | RN preset | [Expo testing docs](https://docs.expo.dev/develop/unit-testing/). |
| **@testing-library/react-native** | **^13.x** | Component tests | Light coverage for grid + result screen. |
| **eslint** + **eslint-config-expo** | Expo template | Lint | Consistency for solo dev. |

### Build, Ship, Update (Post-MVP friendly)

| Technology | Target version | Purpose | Why |
|------------|----------------|---------|-----|
| **expo-dev-client** | Expo-pinned | Dev builds | Required for comfortable SDK 55 workflow. |
| **eas-cli** | latest | Store builds | iOS/Android binaries without local Xcode daily. |
| **expo-updates** | Expo-pinned | OTA JS updates | Copy/assets hotfix without store review (native unchanged). |

---

## Expo SDK Compatibility Notes

### SDK 55 vs SDK 54 (choose one at init)

| Topic | SDK 55 | SDK 54 |
|-------|--------|--------|
| React Native | 0.83 | 0.81 |
| React | 19.2 | 19.1 |
| Architecture | **New Architecture only** (legacy removed) | New Arch default; legacy still possible |
| expo-router | ~6.x | ~5.x |
| Reanimated | 4.x + worklets | 3.x or 4.x depending on template |
| Expo Go (May 2026) | Android CLI / TestFlight; store may lag | Store Expo Go friendly |
| Node | ≥ 20.19 | ≥ 20.19 |

**Silaomo guidance:**

- **Greenfield + willing to run `eas build` / dev client once → SDK 55.** Aligns with 2026 ecosystem direction and PROJECT.md “Expo + RN” long-term.
- **Must scan QR in Expo Go from App Store every day → SDK 54** until Expo Go catches up ([SDK 55 changelog — transition period](https://expo.dev/changelog/sdk-55)).

Always align versions with:

```bash
npx expo install --fix
npx expo-doctor
```

### New Architecture (mandatory on SDK 55)

SDK 55 drops Legacy Architecture. Reanimated 4 and modern gesture handler expect Fabric. No action needed if you start on SDK 55 template — **do not** set `newArchEnabled: false`.

### Reanimated 4 + Expo + NativeWind

| Item | Detail |
|------|--------|
| Install | `npx expo install react-native-reanimated` — also installs compatible **react-native-worklets** on SDK 55. |
| Babel | **Expo:** `babel-preset-expo` usually configures worklets plugin. **Do not** duplicate `react-native-reanimated/plugin` unless docs say so. |
| NativeWind | Use **v4 stable** (`^4.1.23`+). v4.2 had reports with missing worklets on some setups — fix with `npx expo install --fix`. |
| Warning | Deprecated `react-native-reanimated/plugin` may still appear via **nativewind → react-native-css-interop** — often harmless; upgrade NativeWind patch first. |
| Scope for Silaomo | Use **layout animations** + `withTiming` / `withSpring` on result screen — **not** shared element transitions (experimental/removed patterns in v4). |

### NativeWind v4 + expo-router

| Requirement | Notes |
|-------------|-------|
| Tailwind | **v3.4.x only** for NativeWind v4 |
| Metro | `withNativeWind(config)` in `metro.config.js` |
| Babel | `nativewind/babel` + `jsxImportSource: 'nativewind'` in `babel-preset-expo` |
| CSS entry | `global.css` with `@tailwind` directives; import in root `_layout` |
| **Do not** | NativeWind **v5 preview** for production (Tailwind v4, different stack) |

### AsyncStorage

- Install: `npx expo install @react-native-async-storage/async-storage`
- **Unencrypted** key-value store — fine for puzzle progress, not for secrets.
- **Schema:** versioned JSON, e.g. `{ schemaVersion, localDay, gameType, seed, status, completedAt }`.
- **Size:** well under limits for daily state; no SQLite needed for v1.

---

## Puzzle Generation: Pure TypeScript (Recommended)

### Why NOT an npm puzzle library for v1

| Package / approach | Verdict | Reason |
|--------------------|---------|--------|
| **sudoku-gen**, **sudoku** npm | **Avoid** | Sudoku-only; no Binary Puzzle; seed/difficulty contract differs from daily product rule. |
| **Remote API** | **Out of scope** | Violates offline-first and zero backend. |
| **WebView + puzzle JS** | **Avoid** | Bridge overhead, worse UX, harder grid integration. |
| **Native C++ module** | **Avoid** | 9×9 / 10×10 generation is <100ms in Hermes; adds build complexity. |

### Recommended architecture

```
lib/
  daily/
    seed.ts              # mulberry32(dateKey + appSalt) → PRNG
    dailySelector.ts       # PRNG → 'sudoku' | 'binary'
    getDailyPuzzle.ts      # orchestrates engine + difficulty
  puzzles/
    sudoku/
      generator.ts         # fill → remove clues → unique solution check
      validator.ts
      types.ts
    binary/
      generator.ts         # complete board → carve clues → uniqueness
      validator.ts         # row/col: max 2 consecutive, balance, optional unique rows
      types.ts
  storage/
    dailyState.ts          # AsyncStorage read/write + migration
```

### Algorithms (brief)

| Game | Approach | Performance note |
|------|----------|------------------|
| **Sudoku** | Backtracking fill → remove cells while maintaining unique solution | 9×9 trivial on device; cap generation attempts with seed retry |
| **Binary (Takuzu)** | Random valid complete grid → remove clues with solver check | 8×8–12×12 typical for mobile; precompute difficulty bands |

### Deterministic daily puzzle

```typescript
// Conceptual — implement in lib/daily/seed.ts
const dayKey = formatLocalDay(new Date()); // user timezone
const seed = hashString(`${dayKey}:silaomo:v1`);
const rng = mulberry32(seed);
const gameType = rng() < 0.5 ? 'sudoku' : 'binary';
// Same dayKey + version → same type + same puzzle on device
```

中文说明：每日「唯一一局」= **本地日历日 + 固定算法版本号** 派生种子，而不是服务器下发。换设备不会同步是 v1 可接受行为；以后账号同步再扩展。

---

## State Management Guidance

| Approach | When to use | Packages |
|----------|-------------|----------|
| **React Context + useReducer** | MVP ≤3 screens, rare updates | Built-in |
| **Zustand 5** | Grid + daily state shared across routes; want `persist` | `zustand` + optional `zustand/middleware` + AsyncStorage |

**Recommendation for Silaomo:** Start with **Context** if you want zero deps; switch to **Zustand** when `useDailyGame` + game board props become prop-drilling. If using Zustand persist, **whitelist** only serializable fields (not Reanimated shared values).

---

## What NOT to Use (and Why)

| Avoid | Why |
|-------|-----|
| **Bare React Native CLI** (no Expo) | Slower iteration for solo dev; lose `expo install` alignment and EAS. |
| **React Navigation standalone** (without expo-router) | Duplicates default Expo path; more boilerplate for 3 routes. |
| **NativeWind v5 preview** | Unstable; Tailwind v4 + different metro stack. |
| **Tamagui / React Native Paper / UI Kitten** (v1) | Second styling system fights NativeWind. |
| **Redux Toolkit / MobX / Jotai** | Overkill for daily blob + local grid state. |
| **TanStack Query / SWR** | No server data in v1. |
| **SQLite / WatermelonDB / Realm** | No relational data; AsyncStorage enough. |
| **MMKV** (v1) | Faster but extra native setup; optimize only if profiling shows need. |
| **moment.js** | Large; use `Intl` + tiny `lib/date`. |
| **Full date-fns** (v1) | Optional; import single functions if needed (`format` only). |
| **Firebase / Supabase client** (v1) | Backend scope; keep `expo-secure-store` stub only. |
| **Remote Config / CMS for puzzles** | Breaks offline + deterministic daily rule. |
| **Web-only puzzle libs in WebView** | Poor RN integration. |
| **Expo Go as long-term test target on SDK 55** | Fragile during SDK transition; use dev build. |
| **Legacy Architecture** (SDK 55) | Unsupported. |
| **Hermes v1 opt-in** (SDK 55) | Build-from-source cost; skip for MVP ([changelog](https://expo.dev/changelog/sdk-55)). |

---

## Project Bootstrap

### Option A — SDK 55 (recommended greenfield)

```bash
npx create-expo-app@latest foolish-you --template default@sdk-55
cd foolish-you

# Core (Expo pins compatible versions)
npx expo install expo-router expo-dev-client \
  react-native-reanimated react-native-gesture-handler \
  react-native-screens react-native-safe-area-context \
  @react-native-async-storage/async-storage \
  expo-splash-screen expo-status-bar expo-haptics

# UI stack (check NativeWind docs for exact peer versions after init)
npm install nativewind@^4.1.23 tailwindcss@^3.4.17
npm install -D tailwindcss@^3.4.17

# Optional state
npm install zustand@^5.0.13

# Dev/test
npx expo install jest-expo
npm install -D jest @testing-library/react-native @types/jest

npx expo install --fix
npx expo-doctor
```

### Option B — SDK 54 (maximum Expo Go compatibility)

```bash
npx create-expo-app@latest foolish-you
# default template may be SDK 54 during transition — verify in package.json

npx expo install expo-router react-native-reanimated \
  react-native-gesture-handler @react-native-async-storage/async-storage
# ... same as above; use Reanimated 3.x/4.x per expo-doctor output
```

### Suggested `app/` routes (flat, not tabs template)

```
app/
  _layout.tsx      # Stack, global.css, providers
  index.tsx        # Today / start
  game.tsx         # Sudoku or Binary grid
  result.tsx       # Funny feedback + animation
```

Use **`--template default@sdk-55`** then **remove tab boilerplate** — Silaomo is a linear 3-screen flow, not a tab app. The older `tabs` template adds noise.

### Minimal config snippets

**metro.config.js** (NativeWind v4):

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config);
```

**babel.config.js** (typical NativeWind + Expo):

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: ['nativewind/babel'],
  };
};
```

**tailwind.config.js** — `content` must include `./app/**/*.{tsx,ts}` and `./components/**/*.{tsx,ts}`.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why not |
|----------|-------------|-------------|---------|
| Framework | Expo | Flutter | PROJECT.md and team TS/RN path; puzzle UI fits RN. |
| Routing | expo-router | React Navigation manual | More setup for same outcome. |
| Styling | NativeWind v4 | StyleSheet only | Slower iteration for grid spacing/typography. |
| Storage | AsyncStorage | MMKV | Premature optimization for one JSON/day. |
| Puzzles | Pure TS | sudoku-gen npm | Binary puzzle + daily seed ownership. |
| SDK | 55 + dev build | 54 + Expo Go | 55 future-proof; 54 only if Expo Go is hard requirement. |

---

## Verification Checklist (post-init)

- [ ] `npx expo-doctor` — no version mismatches
- [ ] `npx expo install --fix` — all peers aligned
- [ ] NativeWind: test `className="flex-1 bg-white"` renders on device
- [ ] Reanimated: simple `FadeIn` on result screen runs at 60fps
- [ ] AsyncStorage: write/read daily state survives app restart
- [ ] Jest: `lib/puzzles/**/*.test.ts` runs in Node without RN harness
- [ ] Daily seed: same `localDay` → same `gameType` + puzzle (unit test)

---

## Sources

| Source | Confidence | Used for |
|--------|------------|----------|
| [Expo SDK reference](https://docs.expo.dev/versions/latest/) | HIGH | SDK ↔ RN ↔ React matrix, Node version |
| [Expo SDK 55 changelog](https://expo.dev/changelog/sdk-55) | HIGH | New Architecture, Expo Go transition, template |
| [Expo Router introduction](https://docs.expo.dev/router/introduction/) | HIGH | File routing, create command |
| Context7 `/expo/expo` | HIGH | expo-router patterns, AsyncStorage install |
| Context7 `/nativewind/nativewind` | HIGH | Metro `withNativewind`, v4 vs v5 |
| [Reanimated getting started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started) | HIGH | Worklets package, New Architecture |
| npm registry (expo, nativewind, zustand, reanimated) | MEDIUM | Latest patch versions at research time |
| WebSearch: NativeWind + SDK 53/54 issues | MEDIUM | Compatibility pitfalls |

---

## Open Questions (resolve at project init)

1. **SDK 54 vs 55** — confirm Expo Go vs dev-build workflow with project owner.
2. **NativeWind exact patch** — run on device after init; if worklets warning persists, pin NativeWind per [issue #1574](https://github.com/nativewind/nativewind/issues/1574) guidance.
3. **Binary grid default size** — product decision (8×8 vs 10×10), not stack.
4. **Zustand vs Context** — decide in phase 1 implementation (both valid).

*Stack research for roadmap phase planning — pair with `ARCHITECTURE.md`, `FEATURES.md`, `PITFALLS.md`.*
