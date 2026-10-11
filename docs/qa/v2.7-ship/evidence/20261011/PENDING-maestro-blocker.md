# PENDING — Maestro v2.7 ship evidence (resume only)

**Status:** Not D-17 green. Do **not** treat as phase Complete or unlock plan-03 SHIP checkboxes.

**Date:** 2026-10-11  
**UDID used:** `566EE5F2-BFAC-4706-BBE7-3ECD33D441E1` (iPhone 17 Pro · iOS 26.5)  
**Command:** `MAESTRO_UDID=<udid> ./scripts/maestro-v27-ship.sh`

## What passed (partial)

In the full suite run archived in `maestro-v27-ship-acceptance.log` (before final `MAESTRO_EXIT=1`):

| Flow | Result | Screenshots under `screenshots/` |
|------|--------|----------------------------------|
| `v27-carry-sudoku` | green | `01-sudoku-carry-after-fake-next-day`, `02-sudoku-complete-after-carry` |
| `v27-carry-binary` | green | `01`…`03-binary-*` |
| `v27-carry-nonogram` | green | `01`…`03-nonogram-*` |
| `v27-carry-slitherlink` | failed | `01-slitherlink-before-carry` only |
| `v27-carry-freeze-calendar` | not reached | — |

Log ends with `MAESTRO_EXIT=1 (failed on v27-carry-slitherlink)` — **no** `MAESTRO_EXIT=0`.

## Blocker

1. **Slitherlink carry flake / XCTest driver:** after「假日期·次日」, suite either asserted before carry chip settled, or XCTest returned `kAXErrorInvalidUIElement` / hung while waiting for「续局」(see resume attempt in the same acceptance log).
2. **Cold clearState hydrate** occasionally stalls past 90s on splash (mitigated with 180s intro wait; still environment-sensitive).
3. Script default `MAESTRO_UDID` may not match the booted Dev Client sim — pass `MAESTRO_UDID` explicitly.

## Resume

1. Boot sim with Dev Client + Metro `:8081`
2. `MAESTRO_UDID=<booted> ./scripts/maestro-v27-ship.sh`
3. Prefer a clean full five-flow green log ending in `MAESTRO_EXIT=0`
4. Replace this PENDING note once green evidence is archived (or keep alongside for history)

## Not invented

No hand-QA checklist substituted (D-15).
