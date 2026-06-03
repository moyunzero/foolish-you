# Agent Guidelines — 傻了么 (Brainfool)

**Production** offline-first daily puzzle app (Expo SDK 54, iOS/Android). Real users — preserve determinism, offline core, and storage shape.

GSD workflow + project summary → **`CLAUDE.md`**. Human onboarding → **`README.md`**.

---

## Non-negotiables

Break one, you break existing users.

- **Daily determinism.** Same `dateKey` + app version → same `seed`, game type, puzzle. No `APP_SALT`, `deriveSeed`, or selection changes without product approval.
- **Offline-first.** No network for puzzle generation, validation, or persistence (clipboard + system review prompt only).
- **Storage safety.** Always `lib/storage/` migration + validation; never silently drop progress. Bump version constants only with tested read/migration paths — see [docs/CONFIGURATION.md § Storage version bumps](./docs/CONFIGURATION.md#storage-version-bumps).
- **TypeScript strict.** Explicit board/snapshot/status types; no `any` unless documented.
- **Dev-only stays dev-only.** `__DEV__` / `constants/dev.ts` / `app/settings.tsx` must not affect release builds.

---

## Layer rules

| Layer | Rule |
|-------|------|
| `app/` | Routes and screen composition only — no puzzle algorithms |
| `components/` | Reusable UI; extract when reused or screen is unreadable |
| `contexts/DailyGameContext.tsx` | **Source of truth** for today's game (hydrate, play, persist, complete/abandon) |
| `hooks/useDailyGame.ts` | Thin re-export — do **not** duplicate orchestration |
| `lib/puzzles/` | Generation, validation, solving; hydrate uses `selectDailyGameSafe` |
| `lib/storage/` | Snapshot read/write, validate, migrate, recover; history, rating, recovery log |
| `lib/copy/` + `locales/` | All user-facing strings via `useI18n()` — no hardcoded zh/en in UI |
| `constants/` | `config.ts`, `design.ts`, `dev.ts` |

Full directory tree, mermaid flows → [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## i18n (v1.2+)

- Release: device locale → `zh` or `en` (`lib/i18n/resolveLocale.ts`); strings in `locales/zh/`, `locales/en/`.
- UI: `useI18n()` → `strings`, `locale`, `appDisplayName`.
- Tests: `renderWithI18n` / `ScreenProviders`; English smoke in `__tests__/lib/i18n/en-smoke.test.ts` when touching copy/share.

---

## UI

- Default **NativeWind v4** `className`; tokens in `constants/design.ts`, `global.css`, `tailwind.config.js`.
- Inline `style={{ }}` only for cases in [docs/DEVELOPMENT.md § Code style](./docs/DEVELOPMENT.md#code-style). No `StyleSheet.create`.
- Match existing patterns in `components/game/`, `components/grid/`, `components/slitherlink/`.

---

## State

- Daily game: `DailyGameContext` + `useDailyGame()`.
- Ephemeral UI: local `useState` in screens/components.
- Persist: `lib/storage/dailyStorage.ts` debounced (`PLAY_STATE_DEBOUNCE_MS`).
- No Redux/Zustand without explicit request.

---

## Verify before done

All four must pass (same as CI):

```bash
npm run typecheck && npm test && npm run test:migration && npm run lint
```

Details, splits, EAS lockfile → [docs/DEVELOPMENT.md § Verification](./docs/DEVELOPMENT.md#verification-workflow).  
Manual QA → [docs/TESTING.md § Manual QA checklist](./docs/TESTING.md#manual-qa-checklist).

**Frontend paths changed** (`app/`, `components/`, `hooks/`, `contexts/`, `locales/`, `global.css`, `tailwind.config.js`): run [frontend-code-review](./docs/DEVELOPMENT.md#frontend-code-review) before push.

---

## Out of scope (no expansion without approval)

| Area | Notes |
|------|--------|
| Auth / backend | `(auth)/login.tsx` placeholder only |
| Notifications | Defer (v2.1+) |
| Hints, history UI, social, leaderboards | Defer |
| Remote puzzle config | Violates offline-first |
| Heavy date libraries | Use `lib/date/localDay.ts` |

Optional tech-debt read: `.planning/codebase/CONCERNS.md`.
