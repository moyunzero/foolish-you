# v2.6-02 Plan 02 — Simulator device QA

**Date:** 2026-08-10  
**Device:** iPhone 17 Simulator (iOS 26.5)  
**App:** `com.moyunzero.foolish-you` (local `expo run:ios` + Metro)

## Commands

```bash
npx expo start --dev-client --localhost   # if not running
maestro test .maestro/flows/v26/v26-feel-device-qa.yaml
maestro test .maestro/flows/v26/v26-binary-drag-enabled-check.yaml
```

## Results

| Check | Result | Evidence |
|-------|--------|----------|
| Binary drag enables Undo (disabled→enabled→disabled after undo) | PASS | `v26-binary-drag-enabled.png` + enabled asserts |
| Binary vertical scroll chrome remains | PASS | `v26-04-binary-after-scroll.png` |
| Nonogram drag + Undo tap | PASS | `v26-05-nonogram-drag-undo.png` |
| Slitherlink edge taps register (conflict UI) | PASS | `v26-06-slitherlink-taps.png` (red edges + 「环或数字不对」) |
| ScrollView strategy | keep **failOffsetY-first** | no Native() fallback needed on simulator |

## Notes

- Undo control is exposed as a11y `撤销上一步编辑` (not plain `撤销` text).
- Hide DEV bar before board gestures; each type uses `launchApp clearState` so bar can stay hidden.
