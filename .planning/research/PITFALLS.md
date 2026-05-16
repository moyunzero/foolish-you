# Pitfalls Research: 傻了么

## 1. Timezone / midnight boundary

**Warning signs:** User at 23:59 gets new puzzle; travelers see wrong "today"

**Prevention:** Use device local calendar date string (`YYYY-MM-DD` via `Intl` or manual local getters), not UTC `toISOString().slice(0,10)`

**Phase:** Phase 1 (foundation)

## 2. Non-deterministic daily seed

**Warning signs:** Same day reload gives different puzzle

**Prevention:** Single seeded PRNG (e.g. mulberry32) from `hash(date + appSalt)`; persist full record on first open

**Phase:** Phase 1

## 3. Sudoku multiple solutions

**Warning signs:** User "completes" invalid puzzle

**Prevention:** Generator must verify unique solution (solver count === 1) before serving

**Phase:** Phase 2 (Sudoku)

## 4. Binary Puzzle invalid grids

**Warning signs:** Unsolvable or multiple solutions

**Prevention:** Generate by filling with backtracking + full rule check; cap retries with new sub-seed

**Phase:** Phase 3 (Binary)

## 5. Main-thread generation jank

**Warning signs:** UI freeze on first open of day

**Prevention:** Generate once, cache in storage; consider `InteractionManager` or small grid sizes for v1

**Phase:** Phase 2–3

## 6. AsyncStorage race

**Warning signs:** Lost completion state

**Prevention:** Serialize read-modify-write; debounce grid saves; single `DailyGame` JSON blob

**Phase:** Phase 1

## 7. Reanimated misconfiguration

**Warning signs:** Animations no-op or crash

**Prevention:** Follow Expo install docs; babel plugin; rebuild dev client if needed

**Phase:** Phase 4 (polish)

## 8. Scope creep — login before core loop

**Warning signs:** Auth blocks shipping

**Prevention:** Stub `login.tsx` route only; guest path is default

**Phase:** All — enforce Out of Scope
