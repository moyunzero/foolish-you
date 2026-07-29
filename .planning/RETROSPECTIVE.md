# Retrospective

Living log of shipped milestones. Newest first.

## Milestone: v2.5 — Adaptive Mastery

**Shipped:** 2026-07-29  
**Phases:** 6 | **Plans:** 14 | **Tasks:** 33  
**Closeout:** verified_closeout · audit passed

### What Was Built

- FSRS-lite mastery storage + same-day puzzle freeze
- Technique-aware Easy→Expert raters + generate-for-tier for Sudoku / Binary / Nonogram / Slitherlink
- Played-hash FIFO rings + hydrate/complete wire
- Marketing `2.5.0` + bilingual What's New (Content Depth → Adaptive → board-drift)
- Maestro four-type smokes + keep/fresh-date hand flows

### What Worked

- Technique-rater pattern reused across three generators after Sudoku landed
- Ship phase kept EAS/ASC out of planning (D-13) — clear repo-ready boundary
- Milestone audit before complete caught stale DIV traceability only

### What Was Inefficient

- ROADMAP free-form headings blocked `milestone.complete` until a `## Milestone v2.5` section was added
- CLI dir filter does not match `v2.5-01-*` phase dirs → MILESTONES stats needed manual repair
- Composition was once numbered v2.5-01 then renumbered to v2.6 — git grep noise

### Patterns Established

- Dual-track weekday `tier` + frozen `difficultyTier` / mastery snapshot
- forTier softens toward easier only; never SL builtin
- Separate AsyncStorage keys for mastery and played-hash (no daily STORAGE_VERSION bump)

### Key Lessons

- Versioned milestone headings in ROADMAP are required for GSD archive tooling even on free-form roadmaps
- Gallery / disaster-repair paths that use DEFAULT mastery must be disclosed as drift tech debt

### Cost Observations

- Dense 2-day execute window (2026-07-28 → 2026-07-29)
- Heaviest plans: SL rater (~37m), Ship Maestro (~35m)

## Cross-Milestone Trends

| Milestone | Phases | Notes |
|-----------|--------|-------|
| v2.4 | Sunday + nonogram expand | Shipped store `2.4.0` |
| v2.4.2 | Band + 120 + ship docs | Absorbed into `2.5.0` submit |
| v2.5 | Adaptive mastery | Repo ready `2.5.0`; ASC pending |
| v2.6-01 | Composition | Delivered early; Feel paused |
