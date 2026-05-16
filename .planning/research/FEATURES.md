# Features Research: Daily Puzzle Apps

## Table Stakes (must have for v1)

| Feature | Complexity | Notes |
|---------|------------|-------|
| One puzzle per calendar day | Low | Core product contract |
| Clear complete / give up | Low | Drives result screen |
| Input + validation feedback | Medium | Grid UX quality bar |
| Works offline | Low | Local generation + storage |
| Deterministic daily puzzle | Medium | Date-seeded RNG |
| Readable grid on phone | Medium | Touch targets, contrast |

## Differentiators (傻了么 angle)

| Feature | Complexity | Notes |
|---------|------------|-------|
| System picks game type (not user) | Low | Unique hook |
| Funny insult/praise copy on result | Low | Brand personality |
| Binary + Sudoku in one app | Medium | Two generators |
| Zero social noise | Low | Positioning |

## Anti-features (deliberately NOT building)

| Anti-feature | Risk if added |
|--------------|---------------|
| Leaderboards | Scope creep, backend |
| User-chosen difficulty daily | Breaks "one daily" ritual |
| Unlimited random puzzles | Dilutes daily habit |
| Heavy onboarding tutorials | Conflicts with minimalism |
| Account required to play | Friction for MVP |

## Dependencies

```
Daily selector → Puzzle generator → Grid UI → Validation → Result
       ↓
   Storage (date + status)
```

## v1 vs v2 split

- **v1:** Table stakes + differentiators except notifications/login
- **v2:** Push reminders, auth sync, history streaks
