# Domain Pitfalls: 傻了么 (Silaomo)

**Domain:** Expo 每日益智 App（数独 + Binary Puzzle / Takuzu）  
**Researched:** 2026-05-16  
**Confidence:** HIGH（种子/时区/AsyncStorage 有官方或 issue 佐证）；MEDIUM（Binary 生成难度与性能边界来自社区实践，需在实现阶段压测）

---

## Critical Pitfalls

### Pitfall 1: 用 UTC 日期当「今日」键

**What goes wrong:** `new Date().toISOString().slice(0, 10)` 在 UTC+8 凌晨 0:00–7:59 仍显示「昨天」的 UTC 日期；用户以为跨日了，实际种子仍是旧日，或相反在傍晚提前换题。

**Why it happens:** ISO 字符串始终是 UTC；产品需求（DAILY-02/03）写的是**本地自然日**。

**Consequences:** 同一天内谜题不一致、跨日切换错误、与「明天见」状态错位；违反 Core Value。

**Warning signs:**
- 测试只在中午做，从未在 00:00–08:00 本地时间测过
- 日志里 `dateKey` 与系统日历 App 显示的日期不一致
- 用户反馈「过了 12 点还是昨天的题」或「还没 12 点就换新题」

**Prevention:**
- 定义单一函数 `getLocalDateKey(): string`，返回 `YYYY-MM-DD`，**只用本地字段**：`getFullYear()` / `getMonth()` / `getDate()`，或 `Intl.DateTimeFormat('en-CA', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })`（`en-CA` 产出 ISO 形日期）
- **禁止**用 `toISOString().slice(0,10)` 作为业务日键
- 单元测试：对固定 `Date` mock 覆盖 UTC 边界（如本地 2026-05-17 01:00 应得 `2026-05-17`）

**Detection:** 对比 `dateKey` 与设备「设置 → 日期」；自动化测试 mock `Date`。

**Roadmap phase:** **Phase 1**（Foundation — daily pipeline + storage）

**Sources:** [REQUIREMENTS DAILY-02/03]；Expo/Hermes 时区缓存问题见 [expo/expo#38702](https://github.com/expo/expo/issues/38702)（MEDIUM：与 `getDate()` 路径相关，需旅行/改时区回归）

---

### Pitfall 2: Hermes / iOS 后台改时区后 `Date` 局部方法失真

**What goes wrong:** App 在后台时用户改系统时区或夏令时切换后，`getTimezoneOffset()` / `toString()` 可能仍用旧缓存，而 `toLocaleString` 类 API 正确，导致混用 API 时「今日」计算分裂。

**Why it happens:** iOS 进程级时区缓存；Hermes 部分 Date 路径未在 `NSSystemTimeZoneDidChange` 后刷新（[expo/expo#38702](https://github.com/expo/expo/issues/38702)，[facebook/hermes#1751](https://github.com/facebook/hermes/issues/1751)）。

**Consequences:** 与 Pitfall 1 叠加：换时区旅行后 `dateKey` 错误、重复发题或无法换题。

**Warning signs:**
- 仅依赖 `getTimezoneOffset()` 推导本地日
- 从后台恢复后未重新计算 `dateKey`
- 旅行场景未测

**Prevention:**
- 业务日键不依赖 `getTimezoneOffset()` 做逻辑分支
- `AppState` 从 `background` → `active` 时**重新计算** `dateKey` 并与持久化比对；若变化则走「新一天」流程（DAILY-03）
- 避免在 RN 中强依赖 `date-fns-tz` + `Intl` 的 IANA 名（Hermes 上曾报 `RangeError`）；v1 **设备本地日历日**即可，不必做「全球统一午夜」

**Detection:** 真机：后台改时区 → 回前台 → 检查是否触发新日逻辑。

**Roadmap phase:** **Phase 1**（Foundation）；**Phase 5**（Hardening — 旅行/夏令时回归）

---

### Pitfall 3: 每日种子非确定（`Math.random` / 未持久化）

**What goes wrong:** 同一天内杀进程重开，游戏类型或谜面变了；或两台设备「同一天」不一致（若将来做全球同日，需另议；v1 仅同设备）。

**Why it happens:** 用 `Math.random()` 生成；或每次启动重新 `selectGameType()` / 重新 `generate()` 而未读已存 `DailyRecord`。

**Consequences:** 破坏 DAILY-02、STOR-01；用户可刷题；仪式感丧失。

**Warning signs:**
- 没有「首次打开今日 → 写入完整 record → 之后只读」分支
- 种子来自 `Date.now()` 而非 `dateKey`
- 热重载开发时「今天」总在变（开发应用固定 mock date）

**Prevention:**
- `seed = hash(dateKey + APP_SALT)`（32 位整数即可），PRNG 用 **mulberry32** 等可复现算法（同 seed 同序列）
- 流程：`loadStorage()` → 若 `record.dateKey === today` 则**完全复用** `gameType, seed, puzzleSnapshot, status` → 否则 `createNewDailyRecord(seed)`
- 子种子：`sudokuSeed = derive(seed, 'sudoku')`，`binarySeed = derive(seed, 'binary')`，避免两种题型 RNG 流互相消耗不一致
- **DAILY-05**：用派生序列保证「类型」与「同类型谜面」与昨日不同（在 record 里存 `lastGameType` / `lastPuzzleHash`）

**Detection:** 同日重启 10 次，谜面字节级相同；改系统日期到明天再改回（应视为新日，属预期）。

**Roadmap phase:** **Phase 1**（Daily loop core）

**Sources:** [mulberry32 确定性 RNG](https://github.com/cprosche/mulberry32)（MEDIUM）；项目 REQUIREMENTS DAILY-02/05

---

### Pitfall 4: 首次打开当日在主线程同步生成谜题导致卡死

**What goes wrong:** 数独回溯 + Binary 填盘在 JS 主线程跑数百 ms～数秒，首屏白屏或 ANR 感；低端 Android 更明显。

**Why it happens:** 生成与求解都在启动路径上同步执行；Binary 最坏情况迭代量极大（社区报告 8×8 可达百万～2.5 亿次校验，见 [Mortoray Binairo 生成](https://mortoray.com/writing-a-binairo-generator/)）。

**Consequences:** 差评价「打开就卡」；用户以为崩溃。

**Warning signs:**
- `useEffect` 里直接 `generateSudoku()` 无 loading 态
- Binary 用纯暴力填盘无超时/无尺寸上限
- 未对生成耗时打 log

**Prevention:**
- **生成一次、持久化快照**（STOR-01）：网格初始态 + 答案哈希或完整解（体积可控时）写入 `DailyRecord`，之后只读
- v1 网格尺寸保守：**数独 9×9**；**Binary 建议 6×6 或 8×8**，避免 10×10+ 在移动端生成
- Binary：填盘 + 去格用**剪枝 validator**（只判 invalid，见 Pitfall 8）；设 `maxIterations` / `timeoutMs`，失败则 `subSeed++` 重试
- 数独：优先「已知终盘 + 变换」或带唯一解验证的生成器，避免无界回溯；必要时 `InteractionManager.runAfterInteractions` 或 `requestIdleCallback`  polyfill 推迟生成，UI 显示 skeleton
- **不要**在 v1 引入 WASM 除非 Phase 5 仍无法满足；先尺寸 + 缓存

**Detection:** Flipper/性能 monitor 看 JS 线程长任务；首屏 TTI > 500ms 告警。

**Roadmap phase:** **Phase 2**（Sudoku 生成）；**Phase 3**（Binary 生成）；**Phase 5**（Hardening 压测）

---

### Pitfall 5: AsyncStorage 丢状态 / 半写入

**What goes wrong:** 今日已完成，重开又要玩；或进行中的盘面清空；偶发 iOS 丢数据（社区有 ~8KB 与大 payload、force-close 相关 issue，难稳定复现）。

**Why it happens:**
- `setItem` 未 `await`，进程被杀时写入未完成
- 启动时 `useEffect` 在 hydrate 前用默认空状态 **覆盖** 已有存储
- 多 key 非原子更新（只写了 `status` 没写 `grid`）
- `JSON.parse` 无 try/catch，坏数据导致整包回退到默认
- 谜题状态过大或频繁写入

**Consequences:** DAILY-04 失败；用户重复玩或进度丢失。

**Warning signs:**
- 多处 `AsyncStorage.setItem` 散落组件内
- Zustand persist 与手写 storage 双写同一逻辑
- 没有 `isHydrated` / `isLoaded` 门闩就 `save()`
- 存储 key 字符串不一致（`daily_game` vs `dailyGame`）

**Prevention:**
- **单一 blob**：`@silaomo/daily:v1` → 一个 `DailyRecord` JSON（dateKey, gameType, seed, status, puzzleState, completedAt）
- 所有写操作 `await` + try/catch；关键路径（完成/放弃）写完后 **read-back 校验** 可选
- 模式：`load → setHydrated(true) → 之后才允许 save`；save 可 debounce 网格（300–500ms），但 **complete/abandon 立即 flush**
- 解析失败：删除坏 key 或降级为「今日新局」（并打日志），不要 silent 用空对象覆盖
- v1 控制 payload：< 10KB；不把整局历史塞进 AsyncStorage
- Phase 5 若仍丢数据：评估 `expo-sqlite` / MMKV（Out of scope for MVP unless blocking）

**Detection:** 完成 → force quit → 重开；快速连点完成按钮；模拟 `JSON.parse` 抛错。

**Roadmap phase:** **Phase 1**（storage 封装）；**Phase 2–3**（游戏中 debounce 保存）；**Phase 5**（可靠性）

**Sources:** [async-storage#891](https://github.com/react-native-async-storage/async-storage/issues/891)，[async-storage#962](https://github.com/react-native-async-storage/async-storage/issues/962)（LOW：间歇性）；Expo 文档确认 AsyncStorage 为 unencrypted KV（HIGH）

---

### Pitfall 6: Binary Puzzle 规则实现不完整或与规格不一致

**What goes wrong:** 允许三连、行内 0/1 数量不等、重复行/列未禁，导致可填出「合法」但违反 Takuzu 的盘；或 generator 产出无解/多解盘。

**Why it happens:** 规则抄不全；validator 只做「完成态」不做「部分态剪枝」；与 [BIN-02] 选定规格（是否含「行/列互不相同」）未写死。

**Consequences:** 用户完成却判失败；或 generator 死循环/重试爆炸。

**Warning signs:**
- `isValid(grid)` 只在 `isFull(grid)` 时检查
- 三连检测在填第三个时才判，未考虑「已有两个相同且下一格必为对立」的强制推论
- 文档写 Takuzu 四规则，代码少实现「行列唯一」

**Prevention:**
- **先锁定 v1 规则表**（写入 `lib/puzzles/binary/spec.ts`）：
  - 每行/列 0 和 1 数量各为 `width/2`（偶数尺寸）
  - 水平/垂直最多连续 2 个相同
  - （若采用）任意两行、两列不能完全相同 — DAILY 产品未强制，但 BIN-02 提到「按选定规格」；**建议 v1 包含**，与市面 Takuzu 一致
- **Validator 两用途**：
  1. `isInvalidPartial(grid)` — 生成/剪枝用，空位跳过但累计 count 不得超过 half
  2. `isCompleteAndValid(grid)` — 胜负判定用
- 生成：先 **seed 填完整解** → 再挖空并每次验证**唯一解**（或 v1 简化：固定模板 + 置换，降低多解风险）
- 与 UI 切换 0/1 共用同一 validator，避免「显示合法、提交非法」

**Detection:** 属性测试：随机填盘经 validator 与暴力小盘求解对比；已知 Takuzu 例题回归。

**Roadmap phase:** **Phase 3**（Binary Puzzle）；**Phase 1** 仅预留 `GameType` 枚举，不实现

**Sources:** [Mortoray Binairo](https://mortoray.com/writing-a-binairo-generator/)（HIGH 规则与生成陷阱）；[takuzu crate docs](https://docs.rs/takuzu/latest/takuzu/)（MEDIUM）

---

### Pitfall 7: 数独「可填完」但非唯一解

**What goes wrong:** 用户填完 81 格且满足行列宫，但谜题本身有多解；或生成器挖空过度。

**Why it happens:** 只检查「当前无冲突」，未在生成阶段做 uniqueness 计数。

**Consequences:** SUDO-04 与公平性受损；与 Binary 类似但数独更常见此坑。

**Warning signs:**
- 生成 = 随机挖空直到「能解」
- `solve()` 找到第一个解就停

**Prevention:**
- 生成管线：`fillGrid` → `removeClues` 时每次 `countSolutions(limit: 2) === 1`
- 玩家侧冲突检测（SUDO-02）与「完成判定」分离
- 难度 v1 固定一种（如 30–35 given）

**Detection:** 对生成谜题跑双解检测脚本（CI）。

**Roadmap phase:** **Phase 2**（Sudoku）

---

## Moderate Pitfalls

### Pitfall 8: Binary 生成「可解但只能靠猜」

**What goes wrong:** 规则全对，但人类无法逻辑推导，体验差（Mortoray：去格不保证难度）。

**Prevention:** v1 接受较易盘（少挖空）；或挖空时用「固定 lookahead 深度」判定的启发式；Phase 5 再调难度。

**Warning signs:** 内部测盘经常卡死在中段。

**Roadmap phase:** **Phase 3**；调优 **Phase 5**

---

### Pitfall 9: `DAILY-05` 与种子派生冲突

**What goes wrong:** 强制「今天类型 ≠ 昨天」导致某天某种 RNG 分支下选不出合法盘（重试上限耗尽）。

**Prevention:** 类型选择用 `seed` 派生 + 若与 `lastGameType` 相同则 flip；谜题内容用 `subSeed` 重试，与类型解耦。

**Roadmap phase:** **Phase 1**

---

### Pitfall 10: 完成/放弃后仍进入 game 路由

**What goes wrong:** NAV-02 未在 layout 层统一 gate；深链 `/game` 绕过状态。

**Prevention:** `index` 与 `_layout` 根据 `DailyRecord.status` redirect；`game` 屏二次校验。

**Roadmap phase:** **Phase 1**（路由）；**Phase 4**（结果页闭环）

---

### Pitfall 11: 网格状态与存储序列化不一致

**What goes wrong:** `Set`/类实例无法 JSON；或 0/1 vs `'0'/'1'` 混用导致恢复后校验异常。

**Prevention:** 存 plain `number[][]` 或 `('0'|'1'|null)[][]`；单一 `serializePuzzleState` 模块。

**Roadmap phase:** **Phase 2–3**

---

### Pitfall 12: Reanimated / NativeWind 未按 Expo 安装

**What goes wrong:** 结果页动画无效果或 worklet 报错。

**Prevention:** `npx expo install react-native-reanimated`；babel plugin；开发构建变更后清缓存。

**Roadmap phase:** **Phase 4**

---

## Minor Pitfalls

### Pitfall 13: 搞笑文案 RNG 与谜题种子耦合

**What goes wrong:** 同一天文案也固定或每次进结果页变 — 产品未明确；若用同一 RNG 流会消耗谜题随机性。

**Prevention:** `feedbackSeed = derive(seed, 'feedback')` 独立流。

**Roadmap phase:** **Phase 4**

---

### Pitfall 14: 开发环境热更新污染「今日」测试

**Prevention:** `__DEV__` 下可选固定 `dateKey` / 种子（仅 dev menu），勿打进 production。

**Roadmap phase:** **Phase 1**

---

### Pitfall 15: v1 提前做登录 / Supabase

**Prevention:** AUTH-02 仅空路由；不在 Phase 1–4 引真实 auth。

**Roadmap phase:** 全阶段（范围控制）

---

## Expo / React Native 通用陷阱（本项目相关）

| 陷阱 | 表现 | 预防 | Phase |
|------|------|------|-------|
| 未 `await` 的 storage | 偶发丢数据 | 全面 async/await | 1 |
| 在 render 里生成谜题 | 无限重渲染 + 卡 | 生成放 `useDailyGame` 单次 effect | 1–2 |
| Expo Go vs Dev Client 差异 | Reanimated 行为不一 | 结果动画用 dev build 验 | 4 |
| 大列表网格未 memo | 输入卡顿 | `React.memo` 单元格；避免整盘 immutable 深拷贝 | 2–3 |

---

## Phase-Specific Warnings

| Phase | 主题 | 最可能踩坑 | 缓解 |
|-------|------|------------|------|
| **1** | Foundation + daily + storage | UTC 日期键、种子不持久、hydrate 竞态 | `getLocalDateKey`、单 blob、`isHydrated` |
| **2** | Sudoku | 多解谜题、生成卡顿 | unique-solution 生成、缓存快照 |
| **3** | Binary | 规则漏项、生成超时、无解盘 | 锁定 spec、partial validator、尺寸/超时 |
| **4** | Result & UX | 路由绕过、动画配置 | layout gate、expo install reanimated |
| **5** | Hardening | 时区旅行、低端机、存储偶发 | AppState 刷新 dateKey、压测、可选 MMKV |

---

## 研究阶段建议（Roadmap research flags）

| Phase | 是否需专项 plan 前调研 | 原因 |
|-------|------------------------|------|
| 1 | 低 | 模式清晰，以本文件为准 |
| 2 | 中 | 选定数独生成算法（变换法 vs 回溯） |
| 3 | **高** | Binary 规格冻结 + 生成超时策略 + 棋盘尺寸 |
| 4 | 低 | UI/动画为主 |
| 5 | 中 | 真机时区、存储压力测试 |

---

## Sources

| 来源 | 用途 | 置信度 |
|------|------|--------|
| `.planning/PROJECT.md`, `REQUIREMENTS.md` | 需求边界 | HIGH |
| [expo/expo#38702](https://github.com/expo/expo/issues/38702) | iOS/Hermes 时区缓存 | HIGH |
| Expo docs / Context7 — AsyncStorage | KV 语义、安装方式 | HIGH |
| [react-native-async-storage#891](https://github.com/react-native-async-storage/async-storage/issues/891) | 大数据/偶发丢失 | LOW–MEDIUM |
| [Mortoray: Writing a binairo generator](https://mortoray.com/writing-a-binairo-generator/) | Binary 规则、性能、难度 | HIGH |
| [Habitica #6192, #6879](https://github.com/HabitRPG/habitica/issues/6192) | 每日/时区/DST 类问题 | MEDIUM |
| Web: mulberry32、Sudoku WASM/Worker 性能讨论 | 种子与性能方向 | MEDIUM |

---

*Pitfalls dimension complete. Aligns with SUMMARY.md phase numbering (1=Foundation … 5=Hardening).*
