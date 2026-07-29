#!/usr/bin/env bash
# v2.4.2 ship Maestro — one flow per Maestro process (avoids XCTest driver drift).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

UDID="${MAESTRO_UDID:-846693AF-C5EA-4B48-B869-F70D88BFEC90}"
EVIDENCE="${EVIDENCE:-docs/qa/v2.4.2-ship/evidence/$(date +%Y%m%d)}"
mkdir -p "$EVIDENCE"

FLOWS=(
  v242-smoke-sudoku
  v242-smoke-binary
  v242-smoke-nonogram
  v242-smoke-slitherlink
)

if ! lsof -i :8081 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Metro not listening on :8081 — start dev client first (npx expo start)." >&2
  exit 1
fi

log="$EVIDENCE/maestro-v242-ship-acceptance.log"
: >"$log"

for flow in "${FLOWS[@]}"; do
  echo "=== $flow ===" | tee -a "$log"
  xcrun simctl terminate "$UDID" com.moyunzero.foolish-you 2>/dev/null || true
  sleep 3
  set +e
  maestro --udid "$UDID" test ".maestro/flows/v242/${flow}.yaml" --test-output-dir "$EVIDENCE" 2>&1 | tee -a "$log"
  code=${PIPESTATUS[0]}
  set -e
  if (( code != 0 )); then
    echo "MAESTRO_EXIT=1 (failed on $flow)" | tee -a "$log"
    exit 1
  fi
  sleep 2
done

echo "MAESTRO_EXIT=0" | tee -a "$log"
