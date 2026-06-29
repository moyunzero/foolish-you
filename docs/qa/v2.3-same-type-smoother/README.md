# v2.3 同类更顺彩蛋 — 真机 / Maestro 验收证据

> 设计源：[mastery-gentle-growth.md](../../design/mastery-gentle-growth.md) §6  
> 手测清单：[TESTING.md § v2.3](../TESTING.md#v23-同类更顺same-type-smoother-manual-qa)

## 环境

| 项 | 要求 |
|----|------|
| 构建 | `__DEV__` 开发包 |
| 系统语言 | **简体中文**（模拟器/真机；英文系统下「完成今日」等断言会失败，见 v22 i18n flow 测 en） |
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
| `v23-growth-smoother.yaml` | `result-growth-line` **可见**（smoother 文案，如「格外顺手」） | `01-result-smoother-growth-line.png` |

**2026-06-29 验收：** iPhone 17 Pro 模拟器（zh-Hans）— flow **PASS**，截图见 `evidence/20260629/screenshots/`。
