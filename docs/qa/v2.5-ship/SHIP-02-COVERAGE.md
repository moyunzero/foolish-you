# SHIP-02 Coverage Matrix — v2.5 Ship (`2.5.0`)

> Maps [REQUIREMENTS.md](../../../.planning/REQUIREMENTS.md) **SHIP-02** bullets (and related ship-safety rows) → concrete Jest suites.  
> Decisions: **D-08** (matrix + gap fill), **D-09** (hydrate→complete integration), **D-10** (no new frozen rater golden JSON pack).  
> Design source: [v2.5-06-CONTEXT.md](../../../.planning/phases/v2.5-06-ship-2-5-0/v2.5-06-CONTEXT.md).

## D-10 — Rater fixtures policy

Four-type raters / `generateForTier` rely on **existing** unit suites under `__tests__/lib/puzzles/{sudoku,binary,nonogram,slitherlink}/`.  
**Do not** add a frozen ship golden JSON pack under `docs/qa/v2.5-ship/` for raters.

## SHIP-02 + ship-safety matrix

| SHIP-02 / ship-safety bullet | Primary Jest paths | Status |
|------------------------------|--------------------|--------|
| Mastery update math | `__tests__/lib/mastery/applyMasteryOutcome.test.ts`, `__tests__/lib/mastery/fsrsLite.test.ts`, `__tests__/lib/storage/masteryStorage.test.ts` | Covered |
| Rater tier fixtures (4 types) | `__tests__/lib/puzzles/sudoku/rater.test.ts`, `__tests__/lib/puzzles/sudoku/generateForTier.test.ts`, `__tests__/lib/puzzles/binary/rater.test.ts`, `__tests__/lib/puzzles/binary/generateForTier.test.ts`, `__tests__/lib/puzzles/nonogram/rater.test.ts`, `__tests__/lib/puzzles/nonogram/generateForTier.test.ts`, `__tests__/lib/puzzles/slitherlink/rater.test.ts`, `__tests__/lib/puzzles/slitherlink/generateForTier.test.ts` | Covered — **no new golden pack (D-10)** |
| Selector freeze (MAST-04) | `__tests__/lib/mastery/freezeMastery.test.ts` | Covered |
| Hash-avoid | `__tests__/lib/puzzles/dailySelector.test.ts` (`avoidByType`), `__tests__/lib/storage/playedHashStorage.test.ts` | Covered |
| Weekday nudge bounds | `__tests__/lib/mastery/resolveTargetTier.test.ts`, `__tests__/lib/puzzles/difficulty/weekdayBand.test.ts` | Covered |
| In-progress keep (stale-hash / repair) | `__tests__/lib/storage/snapshotPrep.ship02.test.ts` | Covered |
| Complete → `appendPlayedHash` order | `__tests__/lib/storage/playedHashCompletePath.test.ts` | Partial (no hydrate create) |
| Hydrate create (mastery + avoid) → complete → `appendPlayedHash` | `__tests__/lib/daily/shipHydrateCompletePath.test.ts` | **Covered via D-09** |

## Gap fill notes

- **D-09** is the only new automated suite required for SHIP-02 ship readiness: it seeds non-default mastery + an avoid-ring entry, calls `buildNewDailySnapshot`, then mirrors `DailyGameContext` complete side effects (`applyMasteryOutcome` / `saveMasteryState` then `appendPlayedHash`).
- `playedHashCompletePath.test.ts` stays unchanged and does **not** alone satisfy the hydrate→complete row.
- Full AGENTS CI (`typecheck` / `test` / `test:migration` / `lint`) is recorded in phase [v2.5-06-VERIFICATION.md](../../../.planning/phases/v2.5-06-ship-2-5-0/v2.5-06-VERIFICATION.md).

## Related QA links

- Hand QA + Maestro: [README.md](./README.md)
- Manual QA section: [docs/TESTING.md § v2.5 ship](../../TESTING.md)
