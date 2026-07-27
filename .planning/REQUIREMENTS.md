# Requirements: 傻了么 — v2.4.2 Content Depth

**Defined:** 2026-07-26  
**Core Value:** 用户每天打开就能玩到唯一、确定的今日谜题，并在结束时获得情绪化反馈。  
**Milestone Goal:** 拉开四种题型周节奏难度并扩充可感知题量变化；发版披露跨版本变盘；不改手感/UI。

## Locked product decisions

| Decision | Choice | Implication |
|----------|--------|-------------|
| Scope | **Four types only** | Sudoku / Binary / Nonogram / Slitherlink — no fifth type |
| Milestone shape | **Content patch (1A)** | Pause v2.5-02 Feel; absorb DIFF-01/02 here |
| Board drift | **Disclose** | Release notes must declare unplayed-date `puzzleHash` may change; repair-path tests required |
| Salt / selection | **Unchanged** | No `APP_SALT` or `dailySelector` type-pick changes |
| Nonogram growth | **Append-only** | Prefix of existing 90 patterns locked; new patterns only at end |

## v2.4.2 Requirements

### Difficulty bands（BAND）

- [x] **BAND-01**: On weekdays Mon→Sun, Sudoku target givens use a wider band than 33→27 (target **35→24**), still unique-solution and deterministic for a given `dateKey`+seed path
- [x] **BAND-02**: On weekdays Mon→Sun, Binary target givens use a wider band than 26→20 (target **28→18**), still unique-solution and deterministic
- [x] **BAND-03**: Slitherlink easy/medium/hard clue + inside-cell ranges are widened so Mon feels clearly easier and Sun clearly harder than pre-2.4.2, without changing 7×7 rules or UI

### Nonogram pool（NONO）

- [ ] **NONO-01**: User can encounter more Nonogram pictures — curated library grows from **90 → ~120** 8×8 patterns, tiers roughly balanced, **append-only** (existing prefix ids/order locked)
- [ ] **NONO-02**: Every new pattern has zh + en picture titles via existing i18n path (`titleKey` / locales)

### Ship safety（SHIP）

- [ ] **SHIP-01**: App Store / release notes for `2.4.2` explicitly disclose that unplayed dates may get a different board after update (跨版本变盘)
- [x] **SHIP-02**: Automated tests cover stale-generator + in-progress `playState` repair path so an in-progress day is not silently replaced with a different board
- [ ] **SHIP-03**: Marketing version in `app.json` (and related store metadata as needed) is **`2.4.2`**

## Future Requirements

Deferred beyond v2.4.2; tracked but not in current roadmap.

### v2.5 remainder (paused — resume after 2.4.2)

- **FEEL-01..06**: Undo, Sudoku notes, drag-fill, Slitherlink hit radius, first-type demo, haptics
- **DIFF-03**: Signature ~200ms micro-moment for at least one puzzle type

### Growth / distribution

- **GROW-01**: Google Play production listing + Brainfool EN ASO host narrative
- **GROW-02**: Light backup (file/QR) framed as “roast diary” continuity

### Content / types

- **TYPE-01**: Fifth puzzle type — only if ASC shows rotation fatigue
- **TYPE-02**: Year-in-review long image (reuse gallery pipeline; Q4 candidate)

### Persistence upgrades

- **PERS-01**: Persist Sudoku notes across process kill (storage bump + migration) — deferred; v2.5 chose session-only

## Out of Scope

| Feature | Reason |
|---------|--------|
| Fifth puzzle type | Explicitly deferred (TYPE-01) |
| Feel / mechanics (Undo, notes, drag, tutorial, haptics) | Paused v2.5-02 |
| Signature micro-moment (DIFF-03) | Remains for v2.5 resume |
| UI difficulty labels / user-picked difficulty | Week-rhythm stays hidden |
| `APP_SALT` / type selection changes | Determinism non-negotiable |
| Rewriting puzzle rules / solvers | Band polish only |
| Hints / leaderboards / IAP / accounts | Product red lines |
| Reordering or editing existing Nonogram prefix | Append-only lock |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BAND-01 | Phase v2.4.2-01 | Complete |
| BAND-02 | Phase v2.4.2-01 | Complete |
| BAND-03 | Phase v2.4.2-01 | Complete |
| SHIP-02 | Phase v2.4.2-01 | Complete |
| NONO-01 | Phase v2.4.2-02 | Pending |
| NONO-02 | Phase v2.4.2-02 | Pending |
| SHIP-01 | Phase v2.4.2-03 | Pending |
| SHIP-03 | Phase v2.4.2-03 | Pending |

**Coverage:**

- v2.4.2 requirements: 8 total
- Mapped to phases: 8 (Phase v2.4.2-01: 4, Phase v2.4.2-02: 2, Phase v2.4.2-03: 2)
- Unmapped: 0

---
*Requirements defined: 2026-07-26*  
*Last updated: 2026-07-26 — user confirm Looks good (1A, four types, disclose drift)*
