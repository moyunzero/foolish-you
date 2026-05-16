# Stack Research: 傻了么 (Silaomo)

**Confidence:** High (Expo ecosystem); Medium (exact SDK patch versions — verify at init)

## Recommended Stack

| Layer | Choice | Version guidance |
|-------|--------|------------------|
| Runtime | Expo SDK | SDK 52+ (use `npx create-expo-app@latest`) |
| Language | TypeScript | strict mode |
| Routing | expo-router | v4 with SDK 52 |
| UI | NativeWind | v4 + Tailwind CSS 3.4 |
| Animation | react-native-reanimated | Expo-bundled compatible version |
| Gestures | react-native-gesture-handler | Peer of reanimated |
| State | Zustand (optional) | v5 — or React Context for MVP |
| Storage | @react-native-async-storage/async-storage | Expo install |
| Secure (future auth) | expo-secure-store | v1 — stub only in v1 |
| Notifications (v2) | expo-notifications | defer |
| Auth (v2) | expo-auth-session or @supabase/supabase-js | defer |

## Rationale

**Expo managed workflow:** Single developer, OTA updates via EAS, no native puzzle-specific modules required.

**expo-router:** File-based routes match the 3–4 screen app (`index`, `game`, `result`, optional `login` stub).

**NativeWind:** Rapid UI for grids and result screens; consistent spacing/typography without heavy design system.

**Pure TS puzzle engines:** Sudoku generation (backtracking + uniqueness check) and Binary Puzzle (constraint propagation / rejection sampling) run in <100ms on device for daily sizes.

**AsyncStorage:** Sufficient for one daily state blob per day; no SQLite needed for MVP.

## Do NOT Use (v1)

| Avoid | Why |
|-------|-----|
| Custom native modules for puzzles | Unnecessary; JS is fast enough |
| Redux Toolkit | Overkill for daily state + grid |
| Remote config for daily puzzle | Violates offline-first; adds backend |
| moment.js / date-fns heavy usage | Use small `lib/date.ts` with `Intl` or lightweight helpers |
| Tamagui / Paper (v1) | User chose NativeWind; avoid dual UI systems |

## Init Command

```bash
npx create-expo-app@latest silaomo --template tabs
# then: npx expo install expo-router nativewind tailwindcss react-native-reanimated react-native-gesture-handler @react-native-async-storage/async-storage
```

## Verification checklist

- [ ] `expo-doctor` passes after install
- [ ] Reanimated babel plugin in `babel.config.js`
- [ ] NativeWind `metro.config.js` per v4 docs
