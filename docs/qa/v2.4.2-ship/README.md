# v2.4.2 Ship — 真机 / 手测 + Maestro 验收

> 设计源：[v2.4.2-03-CONTEXT.md](../../../.planning/phases/v2.4.2-03-ship-2-4-2/v2.4.2-03-CONTEXT.md)  
> 手测清单：[TESTING.md § v2.4.2](../../TESTING.md#v242-ship-content-depth-manual-qa)  
> 验收矩阵：[v2.4.2-03-VERIFICATION.md](../../../.planning/phases/v2.4.2-03-ship-2-4-2/v2.4.2-03-VERIFICATION.md)

## 环境

| 项 | 要求 |
|----|------|
| 构建 | `__DEV__` 开发包（Expo Dev Client / `npx expo run:ios`） |
| Metro | 端口 **8081** 须在听（脚本会预检） |
| 模拟器 | 已 boot；可选 `MAESTRO_UDID` 覆盖脚本默认 UDID |
| 系统语言 | 简体中文默认（smoke 断言中文 `gameTypes` 标题） |

## 手测顺序（最短路径）

| # | 区域 | 步骤 | 预期 |
|---|------|------|------|
| 1 | 四题型 | Dev 面板依次点 **数独 / 二进制 / 数绘 / 数回**，各至少进一局可玩 | 棋盘可用；标题与题型一致 |
| 2 | 周日紧 | 点 **假日期·周日**（或已知周日 dateKey），必要时再 force 题型 | 周日体感更紧 / 特辑路径仍一天一局 |
| 3 | 周一松 | Simulator Date & Time 设为已知周一（如 `2026-07-06` / `2026-07-13`），杀 App 重开，必要时 force 题型 | 周一抽样明显比周日松 |
| 4 | 进行中 keep | 平常日填几格 → 杀进程 / 重开 | **同盘同进度**。**勿**在检查中途点 Dev force 题型（会清今日存档并重建） |

通过后在 `v2.4.2-03-VERIFICATION.md` 勾选手测行并人工签字。

> **注意：** Unit SHIP-02 已覆盖 stale-hash keep；本表是产品重开手测。Force 题型会 `devRegenerateToday` 并清空今日 archive。

## Maestro（本 phase **必须** — D-09）

四种题型各一条 **进游戏** smoke（D-10）。**不**在 smoke 内强制周一/周日（那是手测 D-11）。

```bash
# Metro 需在跑；逐条 flow（规避长 suite XCTest hierarchy flake）：
./scripts/maestro-v242-ship.sh
# 可选：MAESTRO_UDID=<udid> EVIDENCE=docs/qa/v2.4.2-ship/evidence/$(date +%Y%m%d) ./scripts/maestro-v242-ship.sh
```

| Flow | 断言 | 状态 |
|------|------|------|
| `v242-smoke-sudoku.yaml` | Dev force 数独 → 标题「数独」可见 | 已写 · **必跑** |
| `v242-smoke-binary.yaml` | Dev force 二进制 → 标题「二进制」可见 | 已写 · **必跑** |
| `v242-smoke-nonogram.yaml` | Dev force 数绘 → 标题「数绘」可见 | 已写 · **必跑** |
| `v242-smoke-slitherlink.yaml` | Dev force 数回 → 标题「数回」可见 | 已写 · **必跑** |

## 证据目录（必填归档 — D-09）

```bash
EVIDENCE=docs/qa/v2.4.2-ship/evidence/$(date +%Y%m%d)
mkdir -p "$EVIDENCE"
```

验收要求：

1. 接受日志（脚本默认 `maestro-v242-ship-acceptance.log`）末尾含 **`MAESTRO_EXIT=0`**
2. 每种题型 **≥1** 张截图（smoke 内 `takeScreenshot`）

Phase 「完成」= **仓库就绪**（版本 + What's New + CI + 本目录证据 + VERIFICATION 签字）。**不含** EAS production / ASC Submit for Review（D-13）。
