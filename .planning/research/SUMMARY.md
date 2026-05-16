# Research Summary: 傻了么

**Synthesized:** 2026-05-16

## Stack (decision)

Expo SDK 52+ · TypeScript · expo-router · NativeWind v4 · reanimated · AsyncStorage · pure TS puzzles. No backend for v1.

## Table stakes

Daily deterministic puzzle, offline play, complete/give up flow, grid validation, result feedback.

## Architecture

`useDailyGame` hook centralizes date key + storage + `dailySelector`. Generators stay framework-agnostic. Three main routes: gate → game → result.

## Watch out for

1. Local date vs UTC for "today"
2. Seeded RNG + persist on first open
3. Unique-solution Sudoku generation
4. Valid Binary Puzzle rule enforcement
5. Don't build auth before core loop ships

## Roadmap implications

- **Phase 1:** Scaffold + daily pipeline + storage
- **Phase 2:** Sudoku end-to-end
- **Phase 3:** Binary Puzzle end-to-end
- **Phase 4:** Result UX + animations + optional timer/hints
- **Phase 5:** Hardening + store prep (optional)
