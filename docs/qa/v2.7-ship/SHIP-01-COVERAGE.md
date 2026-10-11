# SHIP-01 Coverage Matrix — v2.7 Ship (Carry)

> Maps [REQUIREMENTS.md](../../../.planning/REQUIREMENTS.md) **SHIP-01** bullets → concrete Jest suites.  
> Decisions: **D-09** (Jest + four-gate CI), **D-11** (gap matrix + central `v27-ship` suite).  
> Design source: [v2.7-05-CONTEXT.md](../../../.planning/phases/v2.7-05-ship/v2.7-05-CONTEXT.md).

## Central suite checkbox

```bash
npm test -- --testPathPattern=v27-ship
# or: npx jest --testPathPattern=v27-ship --runInBand
```

Primary file: [`__tests__/lib/daily/v27-ship.coverage.test.ts`](../../../__tests__/lib/daily/v27-ship.coverage.test.ts)

## SHIP-01 matrix

| SHIP-01 category | Primary Jest paths | Status |
|------------------|--------------------|--------|
| Hydrate keep/advance (`shouldKeepOnHydrate` playing yesterday vs today wall; no keep for completed yesterday) | `__tests__/lib/daily/carryState.test.ts`, `__tests__/lib/daily/dailyHydrate.test.ts`, `__tests__/contexts/DailyGameContext.test.tsx` (carry / suppressMint), `__tests__/lib/daily/v27-ship.coverage.test.ts` | Covered via v27-ship |
| freeze×carry (carry opening yesterday does not false-burn freeze) | `__tests__/lib/streak/freezeLogic.test.ts` (M1/M2/M4), `__tests__/lib/streak/hydrateStreakPipeline.test.ts`, `__tests__/lib/daily/v27-ship.coverage.test.ts` | Covered via v27-ship |
| 日历进行中 (`deriveCalendarCellState` → `in_progress` when `activePlayingDateKey` matches) | `__tests__/lib/calendar/deriveCalendarCellState.test.ts`, `__tests__/lib/calendar/buildMonthGrid.test.ts`, `__tests__/lib/daily/v27-ship.coverage.test.ts` | Covered via v27-ship |
| 跨午夜矩阵 (keep across wall advance; terminal opening → mint) | `__tests__/lib/daily/dailyHydrate.test.ts` (multi-day), `__tests__/lib/streak/hydrateStreakPipeline.test.ts` (M4), `__tests__/lib/daily/v27-ship.coverage.test.ts` | Covered via v27-ship |

## Gap fill notes

- Existing phase suites already cover most SHIP-01 rows; **D-11** adds this matrix doc plus the selectable `v27-ship` suite that re-asserts the four categories in one checkbox.
- Ship invariants in the central suite: daily `STORAGE_VERSION === 3`; no product code / `APP_SALT` / generator changes in this plan.
- Maestro E2E (four-type carry + freeze×calendar) is **plan 02** — not part of this Jest gate.
- Full AGENTS CI (`typecheck` / `test` / `test:migration` / `lint`) is the D-09 sign-off for this wave.

## Related QA links

- Evidence pack (plan 02+): [README.md](./README.md) (created when Maestro evidence lands)
- Prior ship template: [docs/qa/v2.5-ship/SHIP-02-COVERAGE.md](../v2.5-ship/SHIP-02-COVERAGE.md)
- Manual / Maestro conventions: [docs/TESTING.md](../../TESTING.md)
