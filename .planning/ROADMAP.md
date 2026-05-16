# Roadmap: 傻了么 (Silaomo)

## Overview

从空仓库到可玩的每日益智 MVP：先搭建 Expo 骨架与「今日游戏」管道，再分别交付数独与二进制谜题，最后补上结果页幽默反馈与动效，形成「打开 → 玩 → 嘲讽/鼓励 → 明天见」的完整闭环。

## Phases

- [ ] **Phase 1: 基础骨架与每日管道** — Expo、路由、日期种子、存储、入口分流
- [ ] **Phase 2: 数独** — 生成器、网格 UI、校验与完成/放弃
- [ ] **Phase 3: 二进制谜题** — 生成器、网格 UI、规则校验
- [ ] **Phase 4: 结果体验与打磨** — 搞笑文案、动画、计时/提示（可选）

## Phase Details

### Phase 1: 基础骨架与每日管道
**Goal**: 用户打开 App 能看到今日应玩的游戏类型（占位或最小谜题），状态可跨重启保留，跨日自动刷新。  
**Depends on**: Nothing  
**Requirements**: DAILY-01, DAILY-02, DAILY-03, DAILY-04, STOR-01, STOR-02, STOR-03, NAV-01, NAV-02, AUTH-01, AUTH-02  
**UI hint**: yes  
**Success Criteria** (what must be TRUE):
  1. 用户安装后可在真机/模拟器启动 App，无崩溃
  2. 同一天多次打开看到相同 `date` + `type` + `seed`（已持久化）
  3. 修改系统日期到次日（或模拟）后，自动出现新的今日记录
  4. 今日已标记完成/放弃时，入口不再进入可玩态
  5. 无网络时可完成上述流程  
**Plans**: 3 plans

Plans:
- [ ] 01-01: 初始化 Expo + expo-router + NativeWind + 目录结构
- [ ] 01-02: `lib/date.ts`、`lib/storage.ts`、`dailySelector` 与类型定义
- [ ] 01-03: `useDailyGame` + index/game/result 路由分流（game 可占位）

### Phase 2: 数独
**Goal**: 数独作为今日游戏类型时可完整游玩并判定胜负。  
**Depends on**: Phase 1  
**Requirements**: SUDO-01, SUDO-02, SUDO-03, SUDO-04, DAILY-05  
**UI hint**: yes  
**Success Criteria** (what must be TRUE):
  1. 今日类型为数独时，用户可在 9×9 网格输入并清除数字
  2. 冲突时用户得到可见反馈
  3. 用户可放弃；合法填完可完成
  4. 完成后状态写入存储并离开 game 屏
  5. 连续两天不会抽到完全相同的数独盘面（种子/内容变化）  
**Plans**: 2 plans

Plans:
- [ ] 02-01: `sudokuGenerator.ts`（生成、唯一解验证）+ 单元测试
- [ ] 02-02: `SudokuGrid` 组件 + `game.tsx` 数独分支逻辑

### Phase 3: 二进制谜题
**Goal**: Binary Puzzle 作为今日类型时可完整游玩并判定胜负。  
**Depends on**: Phase 2  
**Requirements**: BIN-01, BIN-02, BIN-03, BIN-04, DAILY-05  
**UI hint**: yes  
**Success Criteria** (what must be TRUE):
  1. 今日类型为 binary 时，用户可切换格子 0/1
  2. 违反规则时无法提交或得到明确反馈
  3. 用户可放弃；合法填满可完成
  4. 与数独共用同一套完成/放弃 → 存储 → 导航流程
  5. 二进制与数独在 `dailySelector` 中按日期稳定分配  
**Plans**: 2 plans

Plans:
- [ ] 03-01: `binaryGenerator.ts` + 规则校验 + 测试
- [ ] 03-02: `BinaryGrid` + `game.tsx` binary 分支

### Phase 4: 结果体验与打磨
**Goal**: 完成/放弃后的情绪反馈到位，MVP 可对外试玩。  
**Depends on**: Phase 3  
**Requirements**: RSLT-01, RSLT-02, RSLT-03, GAME-01, GAME-02  
**UI hint**: yes  
**Success Criteria** (what must be TRUE):
  1. 完成与放弃进入结果页，文案池随机且风格区分成功/失败
  2. 结果页有可见动画（reanimated）
  3. 结果页明确传达「明天再来」
  4. （可选）显示本局用时
  5. （可选）至少一种谜题支持有限提示  
**Plans**: 2 plans

Plans:
- [ ] 04-01: `messages.ts` + `FunnyFeedback` + `result.tsx`
- [ ] 04-02: 动效、计时、提示与端到端手动测试清单

## Progress

**Execution Order:** 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 基础骨架与每日管道 | 0/3 | Not started | - |
| 2. 数独 | 0/2 | Not started | - |
| 3. 二进制谜题 | 0/2 | Not started | - |
| 4. 结果体验与打磨 | 0/2 | Not started | - |
