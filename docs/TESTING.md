<!-- generated-by: gsd-doc-writer -->

# Testing — 傻了么 (Brainfool)

This document describes how tests are organized, how to run them locally, how CI enforces quality gates, and when to use manual QA on device.

## Test framework and setup

The project uses **Jest 29** with a **dual-project** configuration defined in `jest.config.js`:

| Project | Preset | Environment | File pattern | Purpose |
|---------|--------|-------------|--------------|---------|
| `unit` | `ts-jest` | `node` | `**/__tests__/**/*.test.ts` | Pure logic: puzzles, storage, date, copy |
| `rtl` | `jest-expo` | React Native (via jest-expo) | `**/__tests__/**/*.test.tsx` | Components, hooks, contexts, screens |

**Dev dependencies:** `jest`, `jest-expo`, `ts-jest`, `@testing-library/react-native`, `react-test-renderer`, `@types/jest`.

**Setup files:**

- `jest.setup.js` — shared by both projects. Mocks AsyncStorage and Reanimated; sets `global.__DEV__ = true` for unit tests.
- `jest.setup.rtl.js` — RTL-only. Mocks `expo-router`, `localDay` (fixed `dateKey`), safe-area context, and `runAfterInteractions`.

Install dependencies before running tests:

```bash
npm ci   # or npm install for local dev
```

The RTL project runs with `maxWorkers: 1` in Jest config to reduce flakiness. The `test:rtl` script also sets `--testTimeout=20000` for slower screen tests.

## Running tests

Run the full suite (both projects):

```bash
npm test
```

Run projects separately:

```bash
npm run test:unit       # jest --selectProjects unit
npm run test:rtl        # jest --selectProjects rtl --testTimeout=20000
npm run test:migration  # migration golden fixtures under __tests__/lib/storage/migration/
```

Run a single file:

```bash
npm test -- __tests__/lib/puzzles/dailySelector.test.ts
npm test -- __tests__/screens/game.test.tsx
```

Filter by test name:

```bash
npm test -- -t "returns stable gameType"
```

**Related checks** (same bar as CI):

```bash
npm run typecheck      # tsc --noEmit
npm run test:migration # storage migration golden fixtures (also in CI)
npm run lint           # expo lint
```

## `__tests__/` layout

```
__tests__/
├── lib/                    # Unit tests (*.test.ts)
│   ├── puzzles/            # Generators, validators, solvers, dailySelectorSafe (incl. slitherlink)
│   ├── storage/            # Snapshot read/write, validation, migration, recover, recoveryLog
│   │   └── migration/      # Golden fixtures (v1→current, v2 snapshots); run via test:migration
│   ├── share/              # buildShareCard
│   ├── stats/              # computeStatsCards, weeklyCompletedCount
│   ├── rating/             # shouldPromptRating, maybePromptAppReview
│   ├── time/               # formatElapsedClock, computeElapsedMs
│   ├── date/               # Local calendar day helpers
│   ├── daily/              # Hydrate/build orchestration
│   ├── streak/             # Streak, freeze, missed-yesterday logic
│   ├── i18n/               # en-smoke, locale helpers
│   └── copy/               # User-facing string helpers
├── integration/            # Cross-module habit-depth flows (v2.1+)
├── contexts/               # DailyGameContext RTL
├── hooks/                  # useSudokuBoard, useBinaryBoard, useSlitherlinkBoard (Nonogram via grid RTL)
├── components/grid/        # SudokuGrid, BinaryGrid, NonogramGrid, SudokuNumpad
├── components/slitherlink/ # SlitherlinkBoard
├── components/game/        # GameScreenHeader, GameScreenFooter
├── screens/                # index, game, result, privacy
└── helpers/                # Shared fixtures and mocks
    ├── dailyGameFixtures.ts
    ├── expoRouterMocks.ts
    ├── renderWithI18n.tsx
    └── screenTestUtils.tsx
```

### Writing new tests

**Unit tests (`.test.ts`):**

- Place under `__tests__/lib/` mirroring the source path (e.g. `lib/puzzles/foo.ts` → `__tests__/lib/puzzles/foo.test.ts`).
- Import from `lib/` with relative paths; no React or RN imports.
- Prefer deterministic inputs (fixed `dateKey`, seeds) for puzzle and daily-selection tests.

**RTL tests (`.test.tsx`):**

- Place under `__tests__/contexts/`, `__tests__/hooks/`, `__tests__/components/`, or `__tests__/screens/` depending on what you are testing.
- Use `@testing-library/react-native` (`render`, `screen`, `fireEvent`, `waitFor`, `act`).
- Wrap screens in `ScreenProviders` from `__tests__/helpers/screenTestUtils.tsx` when `DailyGameContext` or dev UI state is required (`locale` prop defaults to `zh`).
- Use `renderWithI18n` from `__tests__/helpers/renderWithI18n.tsx` for components that only need `I18nTestProvider` (pass `{ locale: 'en' }` for English).
- Use `dailyGameFixtures.ts` for snapshot fixtures and `expoRouterMocks.ts` for navigation assertions.

**What to test where:**

| Layer | Test type | Location |
|-------|-----------|----------|
| Puzzle algorithms, storage, date | Unit | `__tests__/lib/` |
| Context orchestration | RTL | `__tests__/contexts/` |
| Board hooks | RTL | `__tests__/hooks/` |
| Grid components | RTL | `__tests__/components/` |
| Route screens | RTL | `__tests__/screens/` |
| Visual polish, animations, gestures | Manual QA | Device/simulator |

## Coverage requirements

No coverage threshold is configured in `jest.config.js` or CI. Coverage output is not enforced on pull requests.

To generate a local coverage report (optional):

```bash
npm test -- --coverage
```

The `coverage/` directory is gitignored.

## CI integration

Workflow: `.github/workflows/ci.yml` — job **`verify`**

| Trigger | `push` and `pull_request` to `main` or `master` |
|---------|--------------------------------------------------|
| Runner | `ubuntu-latest`, Node.js 22 (from `.nvmrc`), npm 11+ |
| Install | `npm ci` |

Steps (in order):

1. **Typecheck** — `npm run typecheck`
2. **Tests** — `npm test` (runs both `unit` and `rtl` projects; currently 476 tests)
3. **Migration tests** — `npm run test:migration`
4. **Lint** — `npm run lint`

All four must pass before merging. Locally, run the same commands before claiming a change is done.

## Manual QA checklist

Automated tests cover logic and component behavior; they do not replace on-device checks for layout, animations, and persistence across app restarts. Use this checklist after UI or storage changes:

- [ ] **Fresh install / clear storage** — Open app; today's puzzle loads with correct type (**Sudoku**, **Binary**, **Nonogram**, or **Slitherlink 7×7**) for the local day.
- [ ] **Mid-game persistence** — Fill some cells or edges, kill the app, reopen; progress and timer restore.
- [ ] **Complete flow** — Finish today's puzzle; result screen shows copy, three stats cards, share button (if `playState` valid), streak line on win, freeze shield suffix on stats when applicable, and animations.
- [ ] **Share card** — Tap copy/share CTA; clipboard contains emoji grid + timing/streak line (no solution leak for Nonogram/Slitherlink).
- [ ] **Surrender flow** — Abandon from game screen; result screen reflects surrender state (no streak check-in).
- [ ] **Recovery** — Dev「注入坏盘面」→ kill app → reopen; outcome preserved, share hidden if `playState` stripped.
- [ ] **Conflict feedback** — Enter invalid Sudoku/Binary values; conflict highlighting appears. (Nonogram validates on complete only; Slitherlink has no mid-game conflict UI.)
- [ ] **Nonogram complete** — Finish a nonogram day; result shows pattern reveal card with correct title.
- [ ] **Slitherlink complete** — Edge tap cycle (line → × → blank); long-press clears edge; unknown edges allowed at complete gate; result reveal + share without solution leak.
- [ ] **Rules modal** — Open in-game rules; content matches current game type.
- [ ] **Streak** — Win on consecutive days; streak count updates; skip exactly one calendar day with shield → shield consumed, streak preserved on reopen.
- [ ] **Streak freeze UI** — After shield auto-consume on open, game header shows freeze line (**not** missed-yesterday recall).
- [ ] **Missed yesterday** — Gap ≥ 2 days without shield → game header shows recall subline until today is completed.
- [ ] **Dev panel (`__DEV__` only)** — Force game type / **regenerate today** (keep type vs random) / inject recovery / **连签 QA 场景** / clear rating & history / settings locale preview; confirm no dev shortcuts in release builds.
- [ ] **English locale** — Device English or DevTools settings preview; game/result/privacy show **Brainfool** branding; share CTA uses `#Brainfool`.

EAS preview/production builds (`eas.json`) require device verification before tagging release-ready.

### v2.1 habit depth manual QA

Run on **EAS dev client** after `expo-notifications` native rebuild (v21-05). Record build ID when checking off [VERIFICATION.md](../.planning/phases/v2.1-content-depth/VERIFICATION.md).

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 难度 | Dev 改 dateKey Mon vs Sun | 可玩；Mon 更易（givens/clues） |
| 2 | 月历 | 结果页「查看本月」 | Sheet 四态；上月导航；summary 数字 |
| 3 | 月历 | 认怂后 reopen 月历 | ○ 显示（含历史 v2） |
| 4 | 月历 | 护盾消耗日 | 🛡 显示 |
| 5 | 提醒 | 首次通关 soft ask | inline card；abandon 无 |
| 6 | 提醒 | 20:00+ playing | D banner；freeze 日不冲突 |
| 7 | 提醒 | EAS dev build 权限 grant/deny | D-06 行为 |
| 8 | 提醒 | 完成后再到提醒时刻 | 无推送 |
| 9 | 图鉴 | 月历 CTA 生成 | PNG share sheet |
| 10 | i18n | 系统 en | Brainfool + 新 strings |

Start the dev server for manual testing:

```bash
npm start
# or: npx expo start
```

For release confidence, also verify on at least one iOS and one Android device or simulator before shipping store builds (see `eas.json` profiles).

### v2.2 温和成长（Gentle Growth）manual QA

Run on **`__DEV__` build** (Expo dev client or `npx expo run:ios` / `run:android`). Dev panel → **温和成长 QA** 区块注入 history，再点 **一键通关** 进入结果页。设计约束：**永不负反馈**、平常日沉默、无图表/难度标签。

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 结果页·平常 | Dev → **近况·平常** → **一键通关** | 毒舌 + 统计卡之间 **无** 成长行 |
| 2 | 结果页·火热 | Dev → **近况·火热** → **一键通关** | 出现一行正向近况（如「这周几乎天天都来」类 pool） |
| 3 | 结果页·稳定 | Dev → **近况·稳定** → **一键通关** | 出现稳定口吻成长行 |
| 4 | 结果页·召回 | Dev → **近况·召回** → **一键通关** | 出现「好久不见」类召回口吻 |
| 5 | 认怂·召回 | 同上注入召回 → 游戏页 **放弃**（非一键通关） | 仍显示召回成长行（D-10 唯一例外） |
| 6 | 月历·成长 | Dev → **月历·比上月多** → **一键通关** → 结果页 **查看本月** | summary 含「本月通关 N 天」+ **比上月多 M 天**（M>0） |
| 7 | 月历·首月 | 新装 / **重置通关记录** 后仅本月数据 → 打开月历 | **不**出现「比上月多」（lastMonthCount=0 抑制） |
| 8 | i18n | 系统 en 或 Dev 设置预览 en | 成长行与 `completedDeltaLine` 无 CJK；Brainfool 品牌不变 |
| 9 | 存储 | 通关后 DevTools date 行 + migration 测试 | `CompletionEntry` 含 `gameType`（v3）；老数据 migration 不回填 |

截图验收目录与 Maestro 命令见 [docs/qa/v2.2-gentle-growth/README.md](./qa/v2.2-gentle-growth/README.md)。

## Maestro E2E（v2.2）

**前提：** iOS Simulator 或 Android 模拟器已安装 **`com.moyunzero.foolish-you` 开发包**（非 Expo Go；与 `.maestro/flows/smoke-launch.yaml` 相同 `appId`）。Metro 可选（开发包已 bundle 时可离线跑 UI 流）。

```bash
# 单场景（截图 → evidence/YYYYMMDD/screenshots/）
maestro test .maestro/flows/v22/v22-growth-hot.yaml \
  --test-output-dir docs/qa/v2.2-gentle-growth/evidence/$(date +%Y%m%d)

# 全流程（8 场景 + 截图）
maestro test .maestro/flows/v22/v22-full-suite.yaml \
  --test-output-dir docs/qa/v2.2-gentle-growth/evidence/$(date +%Y%m%d)
```

Flows 使用 Dev **温和成长 QA** 场景 + **一键通关**（#5 为游戏页 **放弃**）；#7 先 **重置通关记录**；#8 经 Dev **预览·English**（等同设置页 locale 预览）。结果页交互前会自动 **隐藏调试条**（`隐藏调试条，便于截图`）。截图写入 `--test-output-dir` 下的 `screenshots/`，与 [验收证据 README](./qa/v2.2-gentle-growth/README.md) 对照表一并归档。

## Related docs

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](../AGENTS.md) | Production invariants, layer rules, verify entry points |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | CI commands, frontend CR, DevTools |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layers and data flow |
| [CONFIGURATION.md](./CONFIGURATION.md) | Storage keys and version bump checklist |
