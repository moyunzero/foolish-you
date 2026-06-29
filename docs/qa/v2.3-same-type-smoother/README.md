# v2.3 同类更顺彩蛋 — 真机 / Maestro 验收证据

> 设计源：[mastery-gentle-growth.md](../../design/mastery-gentle-growth.md) §6  
> 手测清单：[TESTING.md § v2.3](../TESTING.md#v23-同类更顺same-type-smoother-manual-qa)

## 环境

| 项 | 要求 |
|----|------|
| 构建 | `__DEV__` 开发包 |
| Dev 面板 | **温和成长 QA** → **彩蛋·同类更顺** |
| 一键通关 | 注入场景后点 **一键通关** |

## Maestro

```bash
cd /path/to/foolish-you
EVIDENCE=docs/qa/v2.3-same-type-smoother/evidence/$(date +%Y%m%d)
mkdir -p "$EVIDENCE"
maestro test .maestro/flows/v23/v23-growth-smoother.yaml --test-output-dir "$EVIDENCE"
```

| Flow | 断言 | 截图 |
|------|------|------|
| `v23-growth-smoother.yaml` | `result-growth-line` **可见** | `01-result-smoother-growth-line.png` |
