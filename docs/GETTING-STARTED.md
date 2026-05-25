<!-- generated-by: gsd-doc-writer -->

# Getting Started — 傻了么 (Silaomo)

This guide takes you from a fresh clone to a running app on a simulator, emulator, or physical device. The project uses the **Expo managed workflow** (no committed `ios/` or `android/` directories).

## Prerequisites

Install these before cloning:

| Requirement | Version / notes |
|-------------|-----------------|
| **Node.js** | 20 LTS or newer (README recommends 20.x) |
| **npm** | 10+ (lockfile: `package-lock.json`) |
| **Git** | To clone the repository |

**To run on a device or simulator:**

| Platform | Options |
|----------|---------|
| **iOS** | macOS with Xcode and iOS Simulator, **or** iPhone/iPad with [Expo Go](https://expo.dev/go) |
| **Android** | Android Studio emulator, **or** a device with Expo Go |
| **Web** | Optional preview via `npm run web` (not the primary target) |

**Optional (store / custom builds):**

- [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`) and an Expo account for `eas build`
- Xcode / Android Studio if you use `npm run ios` or `npm run android` (`expo run:*`), which generates native projects locally via prebuild

No environment variables are required for core gameplay. See [CONFIGURATION.md](./CONFIGURATION.md) for optional `.env.local` conventions.

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/moyunzero/foolish-you.git
   cd foolish-you
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **(Optional) Local env overrides**

   Copy `.env.example` to `.env.local` only if you add client-safe `EXPO_PUBLIC_*` values later. The app does not read env vars in source today.

## Start the dev server

```bash
npm start
```

This runs `expo start` and opens the Expo Dev Tools in the terminal (and often in the browser).

**Useful variants:**

```bash
npx expo start -c    # Clear Metro cache (after babel/plugin or dependency changes)
npm run ios          # expo run:ios — needs native prebuild / dev client setup
npm run android      # expo run:android — same
npm run web          # Web preview
```

After `npm start`:

- Press **`i`** — open the iOS Simulator (macOS + Xcode).
- Press **`a`** — open the Android emulator (Android Studio AVD running).
- **Scan the QR code** — open the project in **Expo Go** on a physical device (same Wi‑Fi as the dev machine, or use tunnel mode from the Expo CLI if needed).

## Expo Go vs development client

| Approach | When to use | This repo |
|----------|-------------|-----------|
| **Expo Go** | Fastest local iteration; no native build | **Default.** SDK 54 + listed dependencies are compatible with Expo Go for day-to-day UI and puzzle work. Use `npm start` and connect via simulator shortcuts or QR code. |
| **Development client** | Custom native code, native modules not in Expo Go, or matching production-like binaries | `eas.json` defines a `development` profile with `developmentClient: true`. Build with EAS (e.g. `eas build --profile development --platform ios`), install the resulting app, then `npm start` and choose that client. `expo-dev-client` is not listed in `package.json`; dev clients are produced via EAS, not checked into the repo. |
| **`expo run:ios` / `expo run:android`** | Local native project + run on simulator/device | Runs `expo run:*` from `package.json`. Requires prebuild (generates `ios/` / `android/` locally). Use when you need direct Xcode/Android Studio debugging outside Expo Go. |

For most contributors, **Expo Go + `npm start`** is enough. Use a **development client** or **`expo run:*`** when you change native configuration or dependencies that Expo Go cannot load.

## First run flow (what you should see)

1. **Launch** — Metro bundles the app; the entry route is `app/index.tsx` (via `expo-router/entry`).

2. **Hydrate** — `DailyGameContext` loads or creates today’s snapshot from AsyncStorage (`@foolish-you/daily-v1`). While loading, the index screen shows **「傻了么」** and **「正在翻出今天的傻题…」**.

3. **Route by status**
   - **`playing`** → redirect to **`/game`** (Sudoku, Binary, or Nonogram grid for today).
   - **`completed`** or **`abandoned`** → redirect to **`/result`** (outcome copy and animations).
   - **Error** → retry UI on the index screen (`refresh()`).

4. **Play** — On the game screen, fill the grid, use the rules (`?`) if needed, then **complete** or **surrender** via the footer. Progress is saved locally (debounced).

5. **Next day** — When the local calendar `dateKey` changes, a new daily puzzle is selected deterministically (same day = same puzzle on the same device).

**Development-only:** In `__DEV__`, a dev tools panel can force game type or reset today (`constants/dev.ts`). It is not included in release builds.

## Common setup issues

| Issue | What to try |
|-------|-------------|
| **Metro / stale bundle** | `npx expo start -c` after changing `babel.config.js`, Reanimated, or NativeWind setup. |
| **Expo Go won’t connect** | Same network as the dev machine; disable VPN; try Expo tunnel; ensure Expo Go version supports SDK 54. |
| **Simulator not opening** | iOS: Xcode installed, simulator booted; Android: AVD running before pressing `a`. |
| **`expo run:ios` / `android` fails** | No native folders in git — run prebuild or use EAS; see [CONFIGURATION.md](./CONFIGURATION.md) EAS profiles. |
| **Wrong Node version** | Use Node 20+ (`node -v`). No `.nvmrc` in repo; align with README. |
| **Tests fail before UI work** | Run `npm install`, then `npm run typecheck`, `npm test`, `npm run lint` (same as CI). |

## Next steps

| Doc | Purpose |
|-----|---------|
| [README.md](../README.md) | Product overview, commands table, project structure |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layers, data flow, and module boundaries |
| [CONFIGURATION.md](./CONFIGURATION.md) | `app.json`, EAS profiles, storage keys, dev flags |
| [AGENTS.md](../AGENTS.md) | Implementation conventions for contributors and AI agents |

**Before opening a PR:** run `npm run typecheck`, `npm test`, and `npm run lint` (see `.github/workflows/ci.yml`).
