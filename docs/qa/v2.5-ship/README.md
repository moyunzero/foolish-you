# v2.5 Ship — 真机 / 手测 + Maestro 验收

> **状态：`2.5.0` 已上架（App Store Live）。** 本目录保留发版前验收与证据归档，不再作为「待提交」清单。  
> 设计源：[v2.5-06-CONTEXT.md](../../../.planning/phases/v2.5-06-ship-2-5-0/v2.5-06-CONTEXT.md)  
> 手测清单：[TESTING.md § v2.5 ship](../../TESTING.md#v25-ship-adaptive-mastery-manual-qa)  
> SHIP-02 覆盖矩阵：[SHIP-02-COVERAGE.md](./SHIP-02-COVERAGE.md)  
> 验收矩阵：[v2.5-06-VERIFICATION.md](../../../.planning/phases/v2.5-06-ship-2-5-0/v2.5-06-VERIFICATION.md)

## 环境

| 项 | 要求 |
|----|------|
| 构建 | `__DEV__` 开发包（Expo Dev Client / `npx expo run:ios`） |
| Metro | 端口 **8081** 须在听（脚本会预检） |
| 模拟器 | 已 boot；可选 `MAESTRO_UDID` 覆盖脚本默认 UDID |
| 系统语言 | 简体中文默认（smoke 断言中文 `gameTypes` 标题） |

## 手测顺序（最短路径 — D-12）

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 四题型 | Dev 面板依次点 **数独 / 二进制 / 数绘 / 数回**，各至少进一局可玩 | 棋盘可用；标题与题型一致 |
| 2 | 进行中 keep | 平常日填几格 → 杀进程 / 重开 | **同盘同进度**。**勿**在检查中途点 Dev force 题型（会清今日存档并重建） |
| 3 | 新鲜日期 create | 打开或强制一个**尚未游玩**的日期 | 更新叙事后仍能成功创建今日/该日谜题 |

通过后在 `v2.5-06-VERIFICATION.md` 勾选手测行并人工签字。

> **注意：** Unit `snapshotPrep.ship02` 已覆盖 stale-hash keep；本表是产品重开手测。Force 题型会清空今日 archive。  
> **不要求**周一/周日作为手测门禁（Pitfall 6 / D-12）——可选抽样即可。

## Maestro（本 phase **必须** — D-11）

四种题型各一条 **进游戏** smoke。**不**在 smoke 内强制周一/周日。

```bash
# Metro 需在跑；逐条 flow（规避长 suite XCTest hierarchy flake）：
./scripts/maestro-v25-ship.sh
# 可选：MAESTRO_UDID=<udid> EVIDENCE=docs/qa/v2.5-ship/evidence/$(date +%Y%m%d) ./scripts/maestro-v25-ship.sh
```

| Flow | 断言 | 状态 |
|------|------|------|
| `v25-smoke-sudoku.yaml` | Dev force 数独 → 标题「数独」可见 | 已写 · **必跑** |
| `v25-smoke-binary.yaml` | Dev force 二进制 → 标题「二进制」可见 | 已写 · **必跑** |
| `v25-smoke-nonogram.yaml` | Dev force 数绘 → 标题「数绘」可见 | 已写 · **必跑** |
| `v25-smoke-slitherlink.yaml` | Dev force 数回 → 标题「数回」可见 | 已写 · **必跑** |
| `v25-hand-keep-sudoku.yaml` | 填一格 → kill → relaunch 同盘同进度 | 已写 · **建议跑**（D-12 H2） |
| `v25-hand-fresh-date.yaml` | `假日期·周日` + 数独进局 | 已写 · **建议跑**（D-12 H3） |

`./scripts/maestro-v25-ship.sh` 默认包含上述 hand flows；`INCLUDE_HAND=0` 可只跑四题型 smoke。

## 证据目录（必填归档 — D-11）

```bash
EVIDENCE=docs/qa/v2.5-ship/evidence/$(date +%Y%m%d)
mkdir -p "$EVIDENCE"
```

验收要求：

1. 接受日志（脚本默认 `maestro-v25-ship-acceptance.log`）末尾含 **`MAESTRO_EXIT=0`**
2. 每种题型 **≥1** 张截图（smoke 内 `takeScreenshot`）

Phase 「完成」= **仓库就绪**（版本 + What's New + CI + 本目录证据 + VERIFICATION 签字）。D-13（EAS production / ASC）已完成：`2.5.0` **Live**。
