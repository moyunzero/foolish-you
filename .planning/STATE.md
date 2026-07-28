---
gsd_state_version: 1.0
milestone: v2.5
milestone_name: Adaptive Mastery
status: in_progress
last_updated: "2026-07-28T11:10:00.000Z"
last_activity: 2026-07-28
progress:
  total_phases: 6
  completed_phases: 1
  total_plans: 4
  completed_plans: 2
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md（**v2.5 Adaptive Mastery** · started 2026-07-28）

**Core value:** 用户每天打开就能玩到唯一、确定的今日谜题，结束时获得情绪化反馈。  
**Current focus:** v2.5-02 Sudoku Technique Rater — PLAN.md ready; next `/gsd-execute-phase v2.5-02`

## Current Position

Phase: v2.5-02 Sudoku Technique Rater — **planned** (2 plans, waves 1→2)  
Prior: v2.5-01 Mastery Foundation — **complete** (VERIFICATION passed)  
Status: `v2.5-02-01-PLAN.md` + `v2.5-02-02-PLAN.md` written; ready for execute  
Last activity: 2026-07-28 — Phase plans for TIER-01/02 Sudoku peak rater + gen-for-tier

## Accumulated Context

### Decisions（v2.5 Adaptive locked, 2026-07-28）

- **Version**: Adaptive Mastery occupies **v2.5**; former Host-Crafted Play → **v2.6**
- **Composition** dir renamed `phases/v2.6-01-composition/`
- **A** personal mastery primary; weekday ≤ ±1 nudge
- **B** forgetting-curve / FSRS-lite per gameType
- **C** complete technique-aware raters for all four types
- **DIV** history hash dedupe + generation diversity
- **No** difficulty UI badges; **no** Feel in this milestone; **no** type-pick `APP_SALT` change
- Marketing target **`2.5.0`**

### Decisions（v2.4.2 locked, 2026-07-26）

- **1A content patch**: independent of Feel; pause Feel (now v2.6-02)
- **Four types only**: Sudoku / Binary / Nonogram / Slitherlink
- **Absorb DIFF-01/02** into v2.4.2; DIFF-03 stays for **v2.6** resume
- **Disclose board drift** in release notes; repair-path tests required
- **Nonogram**: 90→exactly 120 append-only; hist 17/17/17/17/17/17/18; prefix locked (CONTEXT D-01..D-03)
- **Band targets**: Sudoku 35→24; Binary 28→18; Slitherlink widen easy/hard ranges
- Preserve composition artifacts (now under `v2.6-01-composition/`)

### Decisions（v2.6 Host-Crafted locked, 2026-07-22 — was “v2.5”）

- **A1 — Sudoku notes persistence**: session-ephemeral only（同 Undo 档位）；不 bump `STORAGE_VERSION`；杀进程/跨天即丢
- **B — First-type tutorial boundary**: 只讲输入机制（怎么点/怎么拖/怎么长按），绝不讲解题下一步；上线前需产品对文案签核
- **C — Phase 3 difficulty retune disclosure**: 发版说明必须披露跨版本变盘（`puzzleHash` 对未通关日期改变即算变盘）；配套修复路径测试（stale generator + in-progress `playState`）
- **v2.6-01-02:** Headline demoted to Space Mono 12; punchline sole Display 26 (D-20); abandoned statsLine under 数据; D-24 mutex deferred; EXP-01 in `docs/TESTING.md` with FEEL-05 scaffold

### Decisions（v2.4 highlight）

- **v2.4:** 周日特辑 = 仪式感文案 only（不动选题）；数绘 ≈90 全 8×8 只追加；两线独立可并行；接受跨版本变盘；战报/提醒/月历不加特辑
- **v24-01:** Sunday gate = `weekdayBand===6` only；独立 sunday punch/sub 池；`buildShareCard` 不变靠回归测 D-08
- **v24-02:** Target exactly 90 patterns (tiers 13/13/13/13/13/13/12); append-only prefix lock; accept cross-version bucket drift (D-20)
- **v24-03:** Task 3 via Maestro + `__DEV__` 假日期·周日; `scripts/maestro-v24-acceptance.sh` retries XCTest flakes

详见 `.planning/phases/v2.4-sunday-special/v2.4-CONTEXT.md` · `v24-01-SUMMARY.md` · `v24-02-SUMMARY.md` · `v24-03-SUMMARY.md`

### Plans

| Plan | Wave | Status | Objective |
|------|------|--------|-----------|
| v24-01 | 1 | **done** | Sunday Special copy-only（副行 + 毒舌池） |
| v24-02 | 1 | **done** | 数绘 ≈90 追加 + i18n（并行） |
| v24-03 | 2 | **done** | CI + VERIFICATION + Maestro 签核 |
| v2.6-01-01 | 1 | **done** | Copy + hasPlayProgress + slim header/host intro + footer demote |
| v2.6-01-02 | 2 | **done** | Result punchline focus + Abandon sheet + EXP-01 checklist |
| v2.4.2-01-01 | 1 | **done** | SHIP-02 lock + Sudoku/Binary endpoints |
| v2.4.2-01-02 | 2 | **done** | Slitherlink bandLerp + soft dig |
| v2.4.2-02-01 | 1 | **done** | Exact 120 catalog + zh/en titles |
| v2.4.2-02-02 | 2 | **done** | silly-face SHIP-02 nonogram fixture |
| v2.4.2-03-01 | 1 | **done** | Marketing 2.4.2 + What's New + NONO-01 wording |
| v2.4.2-03-02 | 2 | **done** | Maestro + hand QA + CI + VERIFICATION sign-off |
| v2.5-01-01 | 1 | **done** | DifficultyTier + FSRS-lite + masteryStorage |
| v2.5-01-02 | 2 | **done** | persistStatus mastery wire + freezeMastery |
| v2.5-02-01 | 1 | pending | Candidates + technique ladder + rateSudoku fixtures |
| v2.5-02-02 | 2 | pending | generateSudokuPuzzleForTier accept/soften loop |

### Pending Todos

- `/gsd-execute-phase v2.5-02` — Sudoku Technique Rater (2 plans)
- EAS production + ASC Submit for marketing `2.4.2`（可与 Adaptive 并行）
- App Store ASO / ASC 留存观察（并行）
- Google Play（可选）
- 第五玩法（`TYPE-01`）— 挂起至 ASC 证明新鲜感衰减
- v3.0 跨端 — 挂起至丢档反馈或 Android 首发
- Resume **v2.6-02** Feel after Adaptive ships

## Session Continuity

**Resume file:** None (v2.5-01 complete)

**Stopped at:** Completed v2.5-01-02-PLAN.md

**Resume:** `/gsd-execute-phase v2.5-02` or `/gsd-progress`

Last session: 2026-07-28T10:50:00.000Z

## Performance Metrics

| Phase | Plan | Duration | Notes |
|-------|------|----------|-------|
| Phase v2.5-01 P02 | 4min | 2 tasks | 2 files |
| Phase v2.5-01 P01 | 3min | 2 tasks | 16 files |
| Phase v2.4.2-02 P01 | 3min | 2 tasks | 4 files |
| Phase v2.4.2-02 P02 | 1min | 1 task | 1 file |
| Phase v2.4.2-03 P01 | 5min | 2 tasks | 9 files |

## Decisions

- [Phase v2.5-01 P02]: Mastery load-on-demand inside persistStatus only — no Context mastery field
- [Phase v2.5-01 P02]: Mastery save failures warn-only; never roll back daily snapshot
- [Phase v2.4.2-03 P01]: Marketing 2.4.2 only; buildNumber 30 / versionCode 3 unchanged (D-01/D-02); Live 2.4.1 · shipping 2.4.2 (D-03); What's New 3 features then D-05 drift; NONO-01 exact 120 + hist 17×6+18 (D-16)
- [Phase v2.4.2-02 P02]: SHIP-02 nonogram fixture → silly-face + stale-ship02-nonogram-silly-face (D-12..D-14); ship02 suite structure unchanged
- [Phase v2.4.2-02 P01]: Claude-authored 30 mixed silly silhouettes (+6 tier6 then +4× tiers 0–5); PREFIX_IDS from RESEARCH never re-exported after append
- [Phase v2.4.2-02 plan]: Exact length 120 + hist [17,17,17,17,17,17,18] (CONTEXT D-01..D-03 overrides ROADMAP soft ≈120/±1); SHIP-02 nonogram fixture → silly-face in plan 02
- [Phase v2.4.2-01 P02]: SL per-day bandLerp 28→12 / inside 34–46→10–24; carveWithSoften +2×3; builtin&lt;5%
- [Phase v2.4.2-01 P01]: SHIP-02 test-only lock; Sudoku 35→24 / Binary 28→18; generators unchanged (D-11)
- [Phase v2.5-01 P01]: MasteryState is { byType }; version only on persist (D-09)
- [Phase v2.5-01 P01]: Consecutive-N=2 for stored tier; R&lt;0.5 softens resolve only
- [Phase v2.5-01 P01]: MASTERY_STORAGE_KEY=@foolish-you/mastery-v1; STORAGE_VERSION stays 2
