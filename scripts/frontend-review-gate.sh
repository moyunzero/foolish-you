#!/usr/bin/env bash
# Lists frontend files in outgoing changes and runs automated checks before push.
# AI code review (frontend-code-review skill) is still required for urgent/suggestion findings.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FRONTEND_PREFIXES=(
  'app/'
  'components/'
  'hooks/'
  'contexts/'
  'locales/'
  'global.css'
  'tailwind.config.js'
)

is_frontend_file() {
  local f="$1"
  for prefix in "${FRONTEND_PREFIXES[@]}"; do
    [[ "$f" == "$prefix"* || "$f" == "$prefix" ]] && return 0
  done
  return 1
}

collect_changed_files() {
  local mode="${1:-working}"
  local files=()

  if [[ "$mode" == "pre-push" ]]; then
    local remote_ref="${2:-origin/main}"
    if git rev-parse --verify "$remote_ref" >/dev/null 2>&1; then
      while IFS= read -r f; do
        [[ -n "$f" ]] && files+=("$f")
      done < <(git diff --name-only "$remote_ref"...HEAD 2>/dev/null || true)
    else
      # New repo or no remote branch — compare against empty tree of last commit's parent
      while IFS= read -r f; do
        [[ -n "$f" ]] && files+=("$f")
      done < <(git diff --name-only HEAD~1..HEAD 2>/dev/null || git diff --name-only HEAD 2>/dev/null || true)
    fi
  else
    while IFS= read -r f; do
      [[ -n "$f" ]] && files+=("$f")
    done < <(git diff --name-only HEAD 2>/dev/null || true)
    while IFS= read -r f; do
      [[ -n "$f" ]] && files+=("$f")
    done < <(git diff --name-only --cached 2>/dev/null || true)
  fi

  printf '%s\n' "${files[@]}" | sort -u
}

frontend_files=()
while IFS= read -r f; do
  is_frontend_file "$f" && frontend_files+=("$f")
done < <(collect_changed_files "${1:-working}" "${2:-origin/main}")

if [[ ${#frontend_files[@]} -eq 0 ]]; then
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Frontend review gate — Brainfool"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Frontend files in this change set:"
for f in "${frontend_files[@]}"; do
  echo "  • $f"
done
echo ""
echo "Required before push / PR:"
echo "  1. npm run typecheck && npm run lint && npm test"
echo "  2. Agent/human frontend-code-review on the files above"
echo "     Skill: .cursor/skills/frontend-code-review (see docs/DEVELOPMENT.md#frontend-code-review)"
echo ""

if [[ "${FRONTEND_CR_SKIP_CHECKS:-}" != "1" ]]; then
  echo "Running typecheck + lint..."
  npm run typecheck
  npm run lint
  echo "Automated checks passed."
  echo ""
fi

if [[ "${FRONTEND_CR_STRICT:-}" == "1" ]]; then
  if [[ "${FRONTEND_CR_DONE:-}" != "1" ]]; then
    echo "ERROR: FRONTEND_CR_STRICT=1 but FRONTEND_CR_DONE is not set."
    echo "Run frontend-code-review in Cursor, fix urgent issues, then:"
    echo "  FRONTEND_CR_DONE=1 git push"
    exit 1
  fi
fi

echo "Reminder: set FRONTEND_CR_DONE=1 after AI/manual CR if using strict mode."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
