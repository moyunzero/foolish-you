# v2.2 温和成长 — 真机 / Maestro 验收证据

> 设计源：[mastery-gentle-growth.md](../design/mastery-gentle-growth.md)  
> 手测清单：[TESTING.md § v2.2](../TESTING.md#v22-温和成长gentle-growthmanual-qa)

## 环境

| 项 | 要求 |
|----|------|
| 构建 | `__DEV__` 开发包（`npx expo run:ios` / EAS development） |
| `appId` | `com.moyunzero.foolish-you`（iOS） |
| Dev 面板 | 底部 **DEV 调试** → 展开 → **温和成长 QA** |
| 一键通关 | 注入场景后点 **一键通关**（写入合法盘面 + `completed`） |

## Maestro 执行

```bash
cd /path/to/foolish-you
EVIDENCE=docs/qa/v2.2-gentle-growth/evidence/$(date +%Y%m%d)
mkdir -p "$EVIDENCE"
maestro test .maestro/flows/v22/v22-full-suite.yaml --test-output-dir "$EVIDENCE"
```

单场景：

```bash
maestro test .maestro/flows/v22/v22-growth-hot.yaml --test-output-dir "$EVIDENCE"
```

截图与 Maestro 日志写入 `$EVIDENCE/screenshots/` 与同次 run 的时间戳子目录（`commands-*.json` / `xctest_runner_*.log`）。

| Flow | 文件 | 断言 | 截图文件名 |
|------|------|------|------------|
| 平常日沉默 | `v22-growth-silent.yaml` | `result-growth-line` **不可见** | `01-result-silent-no-growth-line.png` |
| 火热 | `v22-growth-hot.yaml` | `result-growth-line` **可见** | `02-result-hot-growth-line.png` |
| 稳定 | `v22-growth-steady.yaml` | `result-growth-line` **可见** | `03-result-steady-growth-line.png` |
| 召回 | `v22-growth-comeback.yaml` | `result-growth-line` **可见** | `04-result-comeback-growth-line.png` |
| 月历 delta | `v22-growth-calendar.yaml` | `calendar-growth-delta` **可见**（文案含「比上月多」） | `05-calendar-growth-delta.png` |
| 认怂·召回 | `v22-growth-comeback-abandon.yaml` | 放弃后 `result-growth-line` **可见**（D-10） | `06-result-comeback-abandon-growth-line.png` |
| 首月抑制 | `v22-growth-calendar-first-month.yaml` | `calendar-growth-delta` **不可见** | `07-calendar-first-month-no-delta.png` |
| i18n · en | `v22-growth-i18n-en.yaml` | `Today · Cleared` + `result-growth-line` + `calendar-growth-delta`（Dev **预览·English**） | `08-i18n-en-result-growth-line.png` · `08-i18n-en-calendar-delta.png` |

截图由 Maestro `takeScreenshot` 写入 `$EVIDENCE/screenshots/`；Maestro 运行日志（`commands-*.json`）默认不纳入版本库。

## 运行记录

| 日期 | 执行人 | 设备 / OS | Maestro | 结果 | 证据路径 |
|------|--------|-----------|---------|------|----------|
| 2026-06-20 | Agent (Cursor) | iPhone 17 Pro · iOS 26.4 模拟器 | 2.6.1 | **8/8 PASS**（01–08；含 #5 认怂·召回 / #7 首月抑制 / #8 i18n） | `evidence/20260620/screenshots/` |
