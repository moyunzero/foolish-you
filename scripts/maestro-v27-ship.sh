#!/usr/bin/env bash
# v2.7 ship Maestro — one flow per Maestro process (avoids XCTest driver drift).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

UDID="${MAESTRO_UDID:-846693AF-C5EA-4B48-B869-F70D88BFEC90}"
EVIDENCE="${EVIDENCE:-docs/qa/v2.7-ship/evidence/$(date +%Y%m%d)}"
mkdir -p "$EVIDENCE"

# D-10 four carry + D-16 freeze×carry/calendar (always-on; no INCLUDE_HAND opt-out).
FLOWS=(
  v27-carry-sudoku
  v27-carry-binary
  v27-carry-nonogram
  v27-carry-slitherlink
  v27-carry-freeze-calendar
)

if ! lsof -i :8081 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Metro not listening on :8081 — start dev client first (npx expo start)." >&2
  exit 1
fi

log="$EVIDENCE/maestro-v27-ship-acceptance.log"
: >"$log"

for flow in "${FLOWS[@]}"; do
  echo "=== $flow ===" | tee -a "$log"
  xcrun simctl terminate "$UDID" com.moyunzero.foolish-you 2>/dev/null || true
  sleep 3
  set +e
  maestro --udid "$UDID" test ".maestro/flows/v27/${flow}.yaml" --test-output-dir "$EVIDENCE" 2>&1 | tee -a "$log"
  code=${PIPESTATUS[0]}
  set -e
  if (( code != 0 )); then
    echo "MAESTRO_EXIT=1 (failed on $flow)" | tee -a "$log"
    exit 1
  fi
  sleep 2
done

echo "MAESTRO_EXIT=0" | tee -a "$log"
