# Architecture Research: 傻了么

## Components

```
┌─────────────────────────────────────────────────────────┐
│                    app/ (expo-router)                    │
│  index.tsx ──► game.tsx ──► result.tsx                  │
│  (gate)         (play)        (feedback)                 │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│              hooks/useDailyGame.ts                       │
│  getTodayKey() → load storage → or dailySelector()      │
└────────────┬────────────────────────────────────────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
┌─────────┐   ┌──────────────┐
│ lib/    │   │ components/  │
│ puzzles │   │ SudokuGrid   │
│ storage │   │ BinaryGrid   │
│ date    │   │ FunnyFeedback│
└─────────┘   └──────────────┘
```

## Data flow

1. **Cold start:** `index` reads `storage.getDailyRecord()`
2. If `record.date !== todayKey` → `dailySelector(seed)` → persist new record
3. If `record.status === playing` → route `game`
4. If `completed | abandoned` → route `result` or home with CTA
5. **Game end:** update record → navigate `result`

## Daily selector contract

```typescript
type GameType = 'sudoku' | 'binary';
interface DailyGame {
  date: string;       // YYYY-MM-DD local
  type: GameType;
  seed: number;
  puzzle: PuzzlePayload;
  status: 'playing' | 'completed' | 'abandoned';
  startedAt?: number;
}
```

`dailySelector(dateKey)`:
- Hash date → pick type (stable)
- Hash date + salt → ensure different puzzle than yesterday
- Delegate to `sudokuGenerator(seed)` or `binaryGenerator(seed)`

## Build order (recommended)

1. Expo scaffold + router + NativeWind
2. `lib/date.ts` + `lib/storage.ts`
3. `dailySelector` + stub puzzles
4. `SudokuGrid` + generator
5. `BinaryGrid` + generator
6. `game` / `result` screens + FunnyFeedback
7. Reanimated polish + optional timer/hints

## Boundaries

- **Generators** never import React
- **Grids** receive puzzle + callbacks only
- **Router screens** orchestrate hooks, not puzzle logic
