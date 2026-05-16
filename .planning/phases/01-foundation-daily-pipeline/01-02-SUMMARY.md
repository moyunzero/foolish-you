---
phase: 01-foundation-daily-pipeline
plan: "02"
subsystem: domain
tags: [jest, async-storage, prng, daily-pipeline]

requires:
  - phase: 01-01
    provides: [Expo 工程与常量目录]
provides:
  - getLocalDateKey 本地日历日
  - 确定性 PRNG 与 dailySelector stub
  - AsyncStorage 每日快照读写
affects: [01-03]

tech-stack:
  added: [ts-jest, @react-native-async-storage/async-storage]
  patterns: [lib 层零 React 依赖, mulberry32 + FNV 哈希, JSON 快照持久化]

key-files:
  created:
    - lib/date/localDay.ts
    - lib/puzzles/rng.ts
    - lib/puzzles/dailySelector.ts
    - lib/puzzles/types.ts
    - lib/storage/dailyStorage.ts
    - constants/config.ts
    - __tests__/lib/**/*.test.ts

requirements-completed: [DAILY-01, DAILY-02, DAILY-03, DAILY-05, STOR-01, STOR-02, STOR-03]

completed: 2026-05-16
---

# Plan 01-02 Summary

**每日管道纯逻辑层可离线单测：本地 dateKey、确定性选题、AsyncStorage 往返。**

## Accomplishments

- `getLocalDateKey()` 使用本地年月日，无 `toISOString().slice`
- `selectDailyGame` 同 dateKey 稳定，且避免与昨日同类型（DAILY-05）
- `loadDailySnapshot` / `saveDailySnapshot` round-trip，损坏 JSON 安全降级
- `npm test`：9 项全部通过（ts-jest + node 环境）
