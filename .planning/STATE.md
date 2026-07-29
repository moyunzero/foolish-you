---
gsd_state_version: 1.0
milestone: v2.5
milestone_name: Adaptive Mastery
current_phase: v2.5-04
current_phase_name: nonogram-tiering
current_plan: v2.5-04-01
status: planning_complete
stopped_at: Planned v2.5-04 — 2 PLAN.md written
last_updated: "2026-07-29T07:15:00.000Z"
last_activity: 2026-07-29
last_activity_desc: Planned v2.5-04 Nonogram Tiering — 2 plans ready
progress:
  total_phases: 25
  completed_phases: 4
  total_plans: 8
  completed_plans: 11
  percent: 12
---

# Project State

## Project Reference

See: .planning/PROJECT.md（**v2.5 Adaptive Mastery** · started 2026-07-28）

**Core value:** 用户每天打开就能玩到唯一、确定的今日谜题，结束时获得情绪化反馈。  
**Current focus:** Phase v2.5-04 — Nonogram Tiering (plans ready)

## Current Position

Phase: v2.5-04 (Nonogram Tiering)
Plan: v2.5-04-01
Status: Planning complete — execute next
Last activity: 2026-07-29 — Planned v2.5-04 (rater Wave 1 + freeze/forTier Wave 2)

## Accumulated Context

### Decisions（v2.5-04 Nonogram Tiering — planned）

- Peak IDs: `simple_few` | `simple_many` | `probe` | `nested_probe` → Easy/Med/Hard/Expert
- Constants locked: EASY_MAX_SWEEPS=3; probe depth 2 / nodes 800 / steps 500 / max productive probes 8; softens 3
- Dual-track: retain weekday `tier` 0..6; freeze separate `difficultyTier`
- forTier = library filter + soften (not carve); no hydrate/selector wire this phase

### Decisions（v2.5-03-02 Slitherlink rater）

- SL 7×7 peakToTier compression: edge_count→easy, vertex_degree→medium, local_loop→hard (SC-1)
- **GAP-D24 closed:** CONTEXT D-24 re-locked to that compression (user option A, 2026-07-29)
- SL forTier Easy–Hard empirical insides; Expert keeps RESEARCH 10/8–18; never builtin

### Decisions（v2.5-03-01 Binary rater）

- Binary Easy carve guide **56** (RESEARCH 30 unreachable for peak Easy)
- Binary uniqueness requires completed-line duplicate filter (not bare line_mask)
- Binary full-board null peak → `adjacent_pair` / easy

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
| v2.5-02-01 | 1 | **done** | Candidates + technique ladder + rateSudoku fixtures |
| v2.5-02-02 | 2 | **done** | generateSudokuPuzzleForTier accept/soften loop |
| v2.5-02-03 | 3 | **done** | Gap closure: sound short_chain + conflict-checked solved |
| v2.5-03-01 | 1 | **done** | Binary full depth rater + generateForTier (TIER-03) |
| v2.5-03-02 | 2 | **done** | Slitherlink full depth rater + generateForTier no-builtin (TIER-05) |
| v2.5-04-01 | 1 | pending | Nonogram FullSettle+probe rater + fixtures (TIER-04) |
| v2.5-04-02 | 2 | pending | Freeze difficultyTier on 120 + generateForTier soften (TIER-04) |

### Pending Todos

- `/gsd-execute-phase v2.5-04` — Nonogram Tiering (2 plans ready)
- EAS production + ASC Submit for marketing `2.4.2`（可与 Adaptive 并行）
- App Store ASO / ASC 留存观察（并行）
- Google Play（可选）
- 第五玩法（`TYPE-01`）— 挂起至 ASC 证明新鲜感衰减
- v3.0 跨端 — 挂起至丢档反馈或 Android 首发
- Resume **v2.6-02** Feel after Adaptive ships

## Session Continuity

**Resume file:** None

**Stopped at:** Planned v2.5-04 — 2 PLAN.md written

**Resume:** `/gsd-execute-phase v2.5-04`

Last session: 2026-07-29T07:15:00.000Z

## Performance Metrics

| Phase | Plan | Duration | Notes |
|-------|------|----------|-------|
| Phase v2.5-01 P02 | 4min | 2 tasks | 2 files |
| Phase v2.5-01 P01 | 3min | 2 tasks | 16 files |
| Phase v2.4.2-02 P01 | 3min | 2 tasks | 4 files |
| Phase v2.4.2-02 P02 | 1min | 1 task | 1 file |
| Phase v2.4.2-03 P01 | 5min | 2 tasks | 9 files |
| Phase v2.5-02 P01 | 8min | 2 tasks | 7 files |
| Phase v2.5-02 P02 | 3min | 2 tasks | 3 files |
| Phase v2.5-02 P03 | 3min | 3 tasks | 4 files |
| Phase v2.5-03 P02 | 37min | 3 tasks | 11 files |

## Decisions

- [Phase v2.5-04 plan]: Peak IDs simple_few|simple_many|probe|nested_probe; EASY_MAX_SWEEPS=3; probe depth 2 / nodes 800 / steps 500 / max probes 8; softens 3; dual-track weekday tier + difficultyTier; forTier=filter not carve
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
- [Phase v2.5-02-01]: File split: candidates + techniqueIds + techniques.ts + chains.ts + rater.ts (no techniques/ dir)
- [Phase v2.5-02-01]: peakToTier maps singles→easy … xy_wing/short_chain→expert per D-02/A4
- [Phase v2.5-02-01]: Frozen fixtures from generator seeds 700022/700433/700012 (+ easy full-house)
- [Phase v2.5-02-01]: Expert caps: LENGTH=6, NODES=2000, STEPS=500 — step/node only
- [Phase v2.5-02 P02]: Public API returns {puzzle, ratedTier, peakTechnique, softened}
- [Phase v2.5-02 P02]: SUDOKU_TIER_MAX_ATTEMPTS=40; SUDOKU_TIER_MAX_SOFTENS=3
- [Phase v2.5-02 P02]: Export generateOnce; legacy generateSudokuPuzzle unchanged
- [Phase v2.5-02 P02]: No dailySelector / mastery hydrate wire (D-06)
- [Phase v2.5-02-03]: CR-01: sound open X-chain fix (not disable short_chain entirely)
- [Phase v2.5-02-03]: IN-02: XY-chain lite non-productive until documented AIC
- [Phase v2.5-02-03]: WR-01: private hasHouseConflicts in rater.ts (no solver placement)
- [Phase v2.5-03-02]: SL 7×7 peakToTier compression: edge_count→easy, vertex_degree→medium, local_loop→hard
- [Phase v2.5-03-02]: SL forTier Easy–Hard empirical insides; Expert keeps RESEARCH 10/8–18; never builtin
