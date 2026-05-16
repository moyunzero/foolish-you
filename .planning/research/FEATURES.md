# Feature Landscape

**Domain:** Daily-only logic puzzle app (Sudoku + Binary Puzzle / Takuzu / Binairo)  
**Product:** 傻了么 (Silaomo) — one ritual puzzle per day, humorous result feedback, no social  
**Researched:** 2026-05-16  
**Confidence:** MEDIUM–HIGH (project scope is explicit; competitor patterns from NYT Games help, App Store listings, Game Developer / Wordle design literature)

## Research Scope

This document maps **table stakes**, **differentiators**, and **anti-features** for a **daily-only** puzzle app combining Sudoku and Binary Puzzle—not a full Sudoku studio with 250k puzzles or a social Wordle clone. Recommendations are filtered through `PROJECT.md` constraints (offline-first, no backend v1, no social, system-random game type).

---

## Table Stakes

Features users expect from **any credible daily puzzle app** and from **grid logic games** specifically. Missing these makes the product feel broken or amateur—not merely “minimal.”

| Feature | Why Expected | Complexity | Notes for Silaomo |
|---------|--------------|------------|-------------------|
| **One puzzle per calendar day** | Wordle, Connections, Binario/Tango daily modes all use a single shared daily challenge; scarcity defines the genre ([NYT Wordle Help](https://help.nytimes.com/hc/en-us/articles/24611727334932-Wordle), [Game Developer once-a-day framework](https://www.gamedeveloper.com/design/the-rise-of-once-a-day-games-lessons-learned-from-wordle-s-legacy)) | **Med** | Core product rule; must block replay of “today” after complete/abandon |
| **Deterministic daily puzzle** | Players expect “today’s puzzle” to be stable on reopen; daily apps use date-based seeds | **Med** | `date seed → game type + puzzle`; same device/date = same puzzle |
| **Midnight (local) rollover** | NYT Wordle/Connections reset at local midnight; streak logic assumes this ([NYT Wordle stats](https://help.nytimes.com/hc/en-us/articles/24611727334932-Wordle)) | **Low–Med** | Use device local timezone; document edge case for travelers |
| **Persist today’s state** | Close app mid-game → resume; see if already played today | **Med** | AsyncStorage: date, type, seed, grid state, status (playing / won / abandoned) |
| **Clear home / today status** | At a glance: unplayed, in progress, done, or come back tomorrow | **Low** | Single screen beats buried menus |
| **Playable Sudoku grid** | Tap cell + number entry; standard 9×9 UX is category baseline ([Sudoku app reviews](https://sudokutimes.com/best-sudoku-apps-for-android/)) | **Med** | MVP: tap + numpad; conflict highlight strongly expected |
| **Playable Binary grid** | Fill cells with two symbols; row/column balance is the game ([Binario / Tango App Store listings](https://apps.apple.com/us/app/tango-daily-binairo-puzzle/id6740433202)) | **Med** | 6×6 or 8×8 for MVP; enforce rules on complete or live-highlight |
| **Win detection** | Automatic “puzzle complete” when valid | **Med** | Sudoku: full grid + rules; Binary: full grid + Takuzu constraints |
| **Explicit abandon / give up** | Daily apps need closure when stuck (Wordle uses max guesses; grid apps use quit) | **Low** | PROJECT requires abandon path → result page |
| **Result screen after win or abandon** | Emotional payoff + closure; standard end-of-session pattern | **Low–Med** | Pair with FunnyFeedback copy + light animation |
| **Offline play** | Commute/travel; Sudoku/Binario competitors advertise offline ([Sudoku Times](https://sudokutimes.com/best-sudoku-apps-for-android/)) | **Low** (given local generation) | No network required for core loop |
| **Undo (≥1 step)** | Grid puzzle apps treat undo as baseline ([Logic Grid Puzzles patterns](https://eggheadgames.com/logicpuzzles)) | **Low–Med** | Sudoku especially; Binary benefits for mis-taps |
| **Conflict / error feedback** | Users expect mistakes to be visible, not silent failure | **Med** | Sudoku: duplicate in row/col/box; Binary: rule violations optional live vs on submit |
| **Readable grid on mobile** | Touch targets, contrast, portrait layout | **Low–Med** | Table stakes for RN; ties to accessibility |
| **Fast session (<10 min)** | Wordle ~3 min; daily ritual = low time cost ([BBC on Wordle design](https://www.bbc.co.uk/news/technology-59881512)) | **Low** | Fixed difficulty per daily puzzle helps |
| **No account required to play** | Wordle’s original appeal; casual dailies allow anonymous play ([TechCrunch Wardle interview](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/)) | **Low** | Aligns with PROJECT v1 guest-only |

### Table Stakes — Deferred but Industry-Common

Worth noting so roadmap doesn’t confuse “minimal” with “missing expected polish”:

| Feature | Why users ask | Complexity | Silaomo v1 stance |
|---------|---------------|------------|-------------------|
| Pencil notes (Sudoku) | Power users expect notes in Sudoku apps | **Med** | **Post-MVP** unless target is Sudoku-regulars |
| Timer / solve time | Many Sudoku apps show elapsed time | **Low** | Optional; not in PROJECT |
| Dark mode | NYT Wordle settings; common accessibility | **Low** | Nice table stakes for polish phase |
| Hints | Standard in puzzle apps | **Med–High** | Conflicts with daily ritual purity; defer |
| Streak counter | Wordle, Connections, Binario daily apps ([NYT Connections stats](https://www.nytco.com/press/introducing-connections-stats-and-streaks/)) | **Med** | **Out of scope v1** per PROJECT; industry table stake |

---

## Differentiators

Features that set the product apart. Not universally expected, but aligned with Silaomo’s positioning.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **System-random daily game type** (Sudoku *or* Binary) | Daily surprise; avoids “I only want Sudoku” split-brain; reinforces “today’s one thing” | **Med** | **Core differentiator** per PROJECT; rare in single-genre apps |
| **Humorous / 毒舌 result copy** (FunnyFeedback) | Emotional hook beyond grid satisfaction; shareable *vibe* without social graph | **Low–Med** | Copy + light Reanimated; category rarely does comedy as primary |
| **Dual logic genres, one ritual** | Broader appeal than pure Sudoku; more depth than pure Wordle | **High** (engineering) | Extension path: new type = selector + grid only |
| **Anti-engagement minimalism** | “Doesn’t want your attention” ([Wardle BBC](https://www.bbc.co.uk/news/technology-59881512)) — no push, no grind | **Low** | Positioning differentiator vs NYT Games suite |
| **Zero backend daily** | Privacy, offline, no ops; uncommon vs server-synced dailies | **Med** (algo quality) | Tradeoff: no global “same puzzle for everyone” unless seed is date-only public |
| **Complete OR abandon → same result path** | Normalizes “I gave up” with personality, not shame | **Low** | Reduces frustration churn on hard Binary days |

### Differentiators — Secondary (post-MVP)

| Feature | Value | Complexity |
|---------|-------|------------|
| Optional gentle streak (local only) | Retention without social | **Low** |
| “Tomorrow’s type” tease at result | Anticipation | **Low** |
| Sound/haptic on complete | Delight | **Low** |
| Widget / Live Activity “played today?” | Platform habit | **Med** |

---

## Anti-Features

Features to **explicitly NOT build** in v1 (and often never), with rationale.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Social graph, friends, leaderboards** | Conflicts with PROJECT minimalism; NYT friends tab is engagement-heavy ([NYT Games app](https://help.nytimes.com/360011158491-New-York-Times-Games/360052273251-The-New-York-Times-Games-app)) | Solo ritual; humor on result screen |
| **User picks Sudoku vs Binary** | Breaks core random-daily rule | Trust daily selector + seed |
| **Unlimited / endless puzzle library** | Turns daily app into grind Sudoku studio | One puzzle per day only |
| **Archive of past days (v1)** | NYT archive is subscriber retention play; scope creep ([Wordle archive](https://help.nytimes.com/hc/en-us/articles/24611727334932-Wordle)) | Defer; focus on today |
| **Account / login required** | Friction for casual dailies | Guest + local persistence |
| **Backend puzzle API** | Ops, offline break, cost | Pure JS generation |
| **Achievement badges / battle pass** | Featuritis; NYT badges add complexity ([Wordle badges](https://help.nytimes.com/hc/en-us/articles/24611727334932-Wordle)) | Funny copy as reward |
| **Aggressive push notifications** | Notification fatigue hurts retention ([affective.com research](https://weareaffective.com/learning-centre/how-does-notification-fatigue-impact-long-term-user-retention)) | Optional opt-in later, never default spam |
| **Ads during active solve** | Top Sudoku apps compete on “no ads in play” ([Sudoku Rabbit positioning](https://sudokurabbit.com/)) | Clean grid; monetize later outside session if ever |
| **Paywall on today’s puzzle** | Breaks daily ritual trust | Free daily core |
| **Difficulty picker on daily** | Decision fatigue ([NN/g simplicity](https://nngroup.com/articles/simplicity-vs-choice/)) | Fixed difficulty per daily seed |
| **Share grid / spoiler-free emoji grid (v1)** | PROJECT out of scope; Wordle share is table stake *for Wordle* | Defer; text-only brag optional later |
| **Multiplayer / races** | Wrong genre | — |
| **AI coach / Wordle Bot style analysis** | NYT subscriber feature; scope ([Wordle Bot](https://help.nytimes.com/hc/en-us/articles/24611727334932-Wordle)) | — |
| **Tutorials longer than 1 screen** | Binary is niche; long onboarding kills D1 | Contextual 3-step max per type |
| **Guess-based Binary generation** | Takuzu players expect logic-solvable ([Binairo App Store](https://apps.apple.com/us/app/binairo-binary-puzzle/id6756125271)) | Generator must guarantee unique logical solution |

### Anti-Features — Tempting “Table Stakes” from Wordle

| Industry norm | Why Silaomo may skip v1 |
|---------------|-------------------------|
| Share results to social | No social scope; humor is in-app |
| Global identical puzzle | Local seed OK for solo ritual; “worldwide same puzzle” needs server or published seed |
| Stats dashboard | PROJECT defers complex stats |
| Streaks | Deferred; can add locally later without social |

---

## Feature Dependencies

```
                    ┌─────────────────────┐
                    │  Date / timezone    │
                    │  (daily boundary)   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Daily selector     │
                    │  (Sudoku | Binary)  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
   ┌──────────▼─────────┐     │     ┌──────────▼──────────┐
   │ Sudoku generator   │     │     │ Binary generator    │
   │ + solver verify    │     │     │ + uniqueness check  │
   └──────────┬─────────┘     │     └──────────┬──────────┘
              │                │                │
   ┌──────────▼─────────┐     │     ┌──────────▼──────────┐
   │ Sudoku Grid UI     │     │     │ Binary Grid UI        │
   │ + undo + validate  │     │     │ + undo + validate     │
   └──────────┬─────────┘     │     └──────────┬──────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Session state      │
                    │  (play / win / quit)│
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Local persistence  │
                    │  (AsyncStorage)     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Result + FunnyFeedback │
                    │  + animation        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Home “today” status │
                    └─────────────────────┘
```

**Critical path for MVP:** daily boundary → selector → generators (with valid puzzles) → grid UIs → persistence → result feedback → home status.

**Parallelizable:** Sudoku stack vs Binary stack after selector interface is defined.

**Blockers:** Without verified generators, grid UI and result flow cannot ship. Without persistence, daily ritual breaks on app kill.

---

## Complexity Summary

| Tier | Features |
|------|----------|
| **Low** | Home status UI, abandon button, result shell, offline flag, no-login, dark mode (later) |
| **Med** | Daily seed/selector, both grids, undo, conflict highlight, persistence, win/abandon flows, FunnyFeedback + animation |
| **High** | Quality Sudoku + Takuzu generators (unique, rated difficulty), dual-type maintenance, pencil notes, hints |
| **Very High** | Social, backend sync, archive, global leaderboard, AI analysis |

---

## MVP Recommendation

**Ship in v1 (aligns with PROJECT Active requirements):**

1. One deterministic daily puzzle (random type Sudoku | Binary)  
2. Full play loop: input, undo, validation feedback, win + abandon  
3. Local persistence across app restarts  
4. Result page with random humorous copy + basic animation  
5. Home screen showing today’s state (play / continue / done / tomorrow)  
6. Offline, guest-only  

**Defer (still table stakes in market, not v1):**

- Pencil notes, timer, streaks, stats, share, dark mode polish, hints  
- Second difficulty tier  
- Push reminders  

**Never (v1):** social, leaderboards, type picker, puzzle archive, login, backend daily, ads-in-play, achievement systems.

---

## Genre Comparison Snapshot

| Capability | Wordle-style daily | Full Sudoku app | Binario daily app | Silaomo target |
|------------|-------------------|-----------------|-------------------|----------------|
| One puzzle/day | ✓ | Optional mode | ✓ | ✓ core |
| Streaks/stats | ✓ | ✓ heavy | ✓ common | ✗ v1 |
| Share | ✓ | Rare | Some | ✗ v1 |
| Unlimited puzzles | ✗ | ✓ core | ✓ common | ✗ |
| Offline | Partial | ✓ | ✓ | ✓ |
| Multiple game types | ✗ | ✗ | ✗ | ✓ differentiator |
| Humor/personality | Light | Rare | Rare | ✓ differentiator |

---

## Sources

| Source | Used for | Confidence |
|--------|----------|------------|
| [PROJECT.md](../PROJECT.md) | Scope, constraints, active requirements | HIGH |
| [NYT Wordle Help](https://help.nytimes.com/hc/en-us/articles/24611727334932-Wordle) | Daily reset, stats, share, settings | HIGH |
| [Game Developer: Once-a-day games](https://www.gamedeveloper.com/design/the-rise-of-once-a-day-games-lessons-learned-from-wordle-s-legacy) | Three pillars: skill levels, conversation, long-term | MEDIUM |
| [BBC: Wordle design philosophy](https://www.bbc.co.uk/news/technology-59881512) | Minimalism, no push, one puzzle | MEDIUM |
| [NYT Connections stats press](https://www.nytco.com/press/introducing-connections-stats-and-streaks/) | Streak as retention mechanic | MEDIUM |
| [Sudoku Times: Android app features](https://sudokutimes.com/best-sudoku-apps-for-android/) | Sudoku table stakes | MEDIUM |
| App Store: [Tango Daily Binairo](https://apps.apple.com/us/app/tango-daily-binairo-puzzle/id6740433202), [Binairo](https://apps.apple.com/us/app/binairo-binary-puzzle/id6756125271) | Binary daily + streak patterns | LOW–MEDIUM |
| [NN/g: Simplicity vs choice](https://nngroup.com/articles/simplicity-vs-choice/) | Anti-feature: too many options | MEDIUM |
| [Notification fatigue](https://weareaffective.com/learning-centre/how-does-notification-fatigue-impact-long-term-user-retention) | Anti-feature: push spam | LOW–MEDIUM |

---

## Gaps / Phase Research Flags

- **Binary grid size & difficulty curve** for casual daily (6×6 vs 8×8 vs 10×10) — needs playtesting phase  
- **Sudoku difficulty** for single daily (medium only vs rotating) — needs puzzle research phase  
- **Whether “same puzzle worldwide”** matters to target users without backend — user research  
- **Abandon vs incomplete streak** semantics if streaks added later — product decision  
