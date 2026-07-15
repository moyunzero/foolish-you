# v2.4 周日特辑 + 数绘扩充 — 真机 / 手测验收

> 设计源：[v2.4-CONTEXT.md](../../../.planning/phases/v2.4-sunday-special/v2.4-CONTEXT.md)  
> 手测清单：[TESTING.md § v2.4](../../TESTING.md#v24-周日特辑--数绘扩充-sunday-special--nonogram-manual-qa)  
> 验收矩阵：[v2.4-VERIFICATION.md](../../../.planning/phases/v2.4-sunday-special/v2.4-VERIFICATION.md)

## 环境

| 项 | 要求 |
|----|------|
| 构建 | `__DEV__` 开发包（Expo dev client / `npx expo run:ios`） |
| **日期前提** | 推荐 `__DEV__` 面板 **假日期·周日**（固定 `2026-07-12`）。也可手动设模拟器日历为周日后杀 App 重开。 |
| 系统语言 | 简体中文默认；英文预览用于零 CJK / Brainfool 抽查 |
| Dev 面板 | **连签 QA 场景** → `freeze-consumed-ui`、`gap2-recall`（测 D-05 互斥） |

## 手测顺序（最短路径）

1. 设周日日期 → 重启 → 进游戏页：有特辑短身份副行（无护盾/召回时）。
2. Dev → **护盾已垫**（`freeze-consumed-ui`）→ 仅护盾行，无「周日特辑」。
3. Dev → **漏签召回**（`gap2-recall`）→ 仅召回行，无特辑叠行。
4. 通关一次 + 认怂一次：结果句可点名特辑；认怂不嘲讽浪费；成长行/smoother 仍至多一行。
5. 拷贝战报：无「周日特辑」/ “Sunday Special”；数绘无图案名剧透。
6. 把日期改回周一～六：游戏页 / 结果页零特辑品牌词。
7. （可选）数绘日确认揭示标题为中英文案而非 raw id。

通过后在 `v2.4-VERIFICATION.md` 勾选 Manual 行并人工签字。

## Maestro（推荐自动化门禁）

须带 **周日 dateKey**。推荐用 `__DEV__` 面板 **假日期·周日**（固定 `2026-07-12`），无需改模拟器系统日历。`status_bar --time` 仍不能改 App `dateKey`。

```bash
# Metro 需在跑（开发包）；推荐逐条 flow（规避长 suite 的 XCTest hierarchy flake）：
./scripts/maestro-v24-acceptance.sh
# 或：
# maestro test .maestro/flows/v24/v24-full-suite.yaml --test-output-dir docs/qa/v2.4-sunday-special/evidence/$(date +%Y%m%d)
```

| Flow | 断言 | 状态 |
|------|------|------|
| `subflows/dev-force-sunday.yaml` | 点「假日期·周日」→ header 见 `2026-07-12` | 已写 |
| `v24-sunday-subline.yaml` | 「今天是周日特辑。」可见 | 已写 |
| `v24-d05-freeze-wins.yaml` | 护盾行胜出，无特辑叠行 | 已写 |
| `v24-d05-recall-wins.yaml` | 召回行胜出，无特辑叠行 | 已写 |
| `v24-sunday-complete-roast.yaml` | 通关烤串含特辑 + growth line | 已写 |
| `v24-sunday-abandon-roast.yaml` | 认怂烤串含特辑语气，无「浪费」 | 已写 |
| `v24-full-suite.yaml` | 以上串联 | 已写 |
## 证据目录（可选归档）

```bash
EVIDENCE=docs/qa/v2.4-sunday-special/evidence/$(date +%Y%m%d)
mkdir -p "$EVIDENCE/screenshots"
# 将 Simulator 截图拖入 screenshots/ 并在此 README 下记录设备型号 + 日期
```
