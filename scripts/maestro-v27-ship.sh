#!/usr/bin/env bash
# v2.7 ship Maestro — one flow per Maestro process (avoids XCTest driver drift).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Override with MAESTRO_UDID when the default sim is not the booted Dev Client.
# Do NOT use shell placeholders like <booted-udid> — zsh treats <…> as redirection.
UDID="${MAESTRO_UDID:-566EE5F2-BFAC-4706-BBE7-3ECD33D441E1}"
EVIDENCE="${EVIDENCE:-docs/qa/v2.7-ship/evidence/$(date +%Y%m%d)}"
# Raw Maestro CLI dumps (ignored by git); curated screenshots stay in $EVIDENCE/screenshots/
MAESTRO_RUNS="${EVIDENCE}/.maestro-runs"
mkdir -p "$EVIDENCE/screenshots" "$MAESTRO_RUNS"

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

# XCTest often dies with Connection refused / set-permissions port failures —
# not a product assert. Retry with driver reinstall after longer cooldown.
MAX_ATTEMPTS="${MAESTRO_FLOW_ATTEMPTS:-3}"
INTER_FLOW_SLEEP="${MAESTRO_INTER_FLOW_SLEEP:-5}"
RETRY_SLEEP="${MAESTRO_RETRY_SLEEP:-10}"

for flow in "${FLOWS[@]}"; do
  echo "=== $flow ===" | tee -a "$log"
  attempt=1
  code=1
  while (( attempt <= MAX_ATTEMPTS )); do
    if (( attempt > 1 )); then
      echo "(retry $attempt/$MAX_ATTEMPTS after driver/infra flake — reinstall XCTest driver)" | tee -a "$log"
      sleep "$RETRY_SLEEP"
    fi
    xcrun simctl terminate "$UDID" com.moyunzero.foolish-you 2>/dev/null || true
    sleep 3
    set +e
    if (( attempt > 1 )); then
      maestro --udid "$UDID" test ".maestro/flows/v27/${flow}.yaml" \
        --test-output-dir "$MAESTRO_RUNS" \
        --reinstall-driver \
        2>&1 | tee -a "$log"
    else
      maestro --udid "$UDID" test ".maestro/flows/v27/${flow}.yaml" \
        --test-output-dir "$MAESTRO_RUNS" \
        2>&1 | tee -a "$log"
    fi
    code=${PIPESTATUS[0]}
    set -e
    if (( code == 0 )); then
      break
    fi
    attempt=$((attempt + 1))
  done
  if (( code != 0 )); then
    echo "MAESTRO_EXIT=1 (failed on $flow)" | tee -a "$log"
    exit 1
  fi
  sleep "$INTER_FLOW_SLEEP"
done

echo "MAESTRO_EXIT=0" | tee -a "$log"
