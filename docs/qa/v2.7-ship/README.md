# v2.7 Ship — Carry Maestro 验收

> 设计源：[v2.7-05-CONTEXT.md](../../../.planning/phases/v2.7-05-ship/v2.7-05-CONTEXT.md)  
> SHIP-01 Jest 覆盖矩阵：[SHIP-01-COVERAGE.md](./SHIP-01-COVERAGE.md)  
> Maestro 证据目录：[evidence/](./evidence/)（green 归档见 `evidence/20261011/`）  
> 验收矩阵 / 仓库就绪签核：[v2.7-05-VERIFICATION.md](../../../.planning/phases/v2.7-05-ship/v2.7-05-VERIFICATION.md)

## 环境

| 项 | 要求 |
|----|------|
| 构建 | `__DEV__` 开发包（Expo Dev Client / `npx expo run:ios`） |
| Metro | 端口 **8081** 须在听（脚本会预检） |
| 模拟器 | 已 boot；可选 `MAESTRO_UDID` 覆盖脚本默认 UDID |
| 系统语言 | 简体中文默认（flow 断言中文 CTA / 题型标题） |
| Maestro CLI | 本机已安装；日志与截图写入 `evidence/`（勿写入 `.env` / tokens） |

## Maestro（本 phase **必须** — D-09 / D-10 / D-16）

四题型各一条 **完整 carry**（假次日 → 续局 → terminal），另必跑 freeze×carry + 月历进行中。无额外手测清单门禁（D-15）。

```bash
# Metro 需在跑；逐条 flow（规避长 suite XCTest hierarchy flake）：
./scripts/maestro-v27-ship.sh
# 可选：MAESTRO_UDID=<udid> EVIDENCE=docs/qa/v2.7-ship/evidence/$(date +%Y%m%d) ./scripts/maestro-v27-ship.sh
```

| Flow | 断言 | 状态 |
|------|------|------|
| `v27-carry-sudoku.yaml` | force 数独 → 填一格 → 假次日 → 续局 → DEV 填满盘面 → 产品「完成今日」 | 已写 · **必跑** |
| `v27-carry-binary.yaml` | force 二进制 → 假次日 → 续局 → DEV 一键通关 | 已写 · **必跑** |
| `v27-carry-nonogram.yaml` | force 数绘 → 假次日 → 续局 → DEV 一键通关 | 已写 · **必跑** |
| `v27-carry-slitherlink.yaml` | force 数回 → 假次日 → 续局 → DEV 一键通关 | 已写 · **必跑** |
| `v27-carry-freeze-calendar.yaml` | carry + 月历「进行中」+ 通关（D-16） | 已写 · **必跑** |

Terminal 混合路径（D-12）：数独 = 填满盘面 + 产品 CTA；其余三题型 = Context「一键通关」（禁止 storage inject + refresh remint）。

## 证据目录（必填归档 — D-17）

```bash
EVIDENCE=docs/qa/v2.7-ship/evidence/$(date +%Y%m%d)
mkdir -p "$EVIDENCE"
```

验收要求（green）：

1. 接受日志（脚本默认 `maestro-v27-ship-acceptance.log`）末尾含 **`MAESTRO_EXIT=0`**
2. 每条 flow **≥1** 张截图（`takeScreenshot` / Maestro `--test-output-dir`）

若模拟器 / Metro / Maestro CLI 不可用：在 `evidence/<date>/` 留下简短 **PENDING** 说明以便 resume；**PENDING 不满足 D-17 green**，也不得当作 plan-03 SHIP/Complete 成功。

## Optional CI（非阻断 — D-13）

Maestro **不上** `.github/workflows/ci.yml` 的 `verify` job。本仓库暂不新增独立 Maestro workflow（无共享 macos + Dev Client secrets）；本地以 `./scripts/maestro-v27-ship.sh` 为准。若日后补 `workflow_dispatch` / schedule job，失败亦不得挡 merge。

## Phase 「完成」定义

Phase 「完成」= **仓库就绪**（营销版本 `2.7.0` + CONFIG Carry What's New + 四门 CI + 本目录 green 证据 `MAESTRO_EXIT=0` + [v2.7-05-VERIFICATION.md](../../../.planning/phases/v2.7-05-ship/v2.7-05-VERIFICATION.md)）— **明确不是** EAS production / App Store Connect 粘贴（D-08）。ASC / EAS 另轨 ops。
