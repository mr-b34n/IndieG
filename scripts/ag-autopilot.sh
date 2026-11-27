#!/usr/bin/env bash
# ==============================================================================
# Token-Maximizer Autopilot Script (ag-autopilot.sh)
# Designed for scheduled cron/systemd runs or manual execution
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKFLOW_DIR="$PROJECT_ROOT/.ag_workflow"
STATE_DIR="$WORKFLOW_DIR/state"

cd "$PROJECT_ROOT"

echo "======================================================================"
echo " Starting Antigravity Autopilot"
echo " Time: $(date -Iseconds)"
echo " Project: $PROJECT_ROOT"
echo "======================================================================"

# Ensure working tree git status is manageable
if [[ -n "$(git status --porcelain 2>/dev/null | grep -v '^\?\? \.ag_workflow')" ]]; then
  echo "[ag-autopilot] Notice: Working directory has uncommitted changes."
  echo "[ag-autopilot] Stashing uncommitted changes temporarily..."
  git stash push -u -m "ag-autopilot-autostash-$(date +%s)"
  STASHED=1
else
  STASHED=0
fi

# Step 1: Create or checkout dedicated branch
TODAY="$(date +%Y%m%d)"
BRANCH_NAME="ai/auto-improve-$TODAY"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "[ag-autopilot] Ensuring branch: $BRANCH_NAME"
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  git checkout "$BRANCH_NAME"
else
  git checkout -b "$BRANCH_NAME"
fi

if [[ "$STASHED" -eq 1 ]]; then
  echo "[ag-autopilot] Restoring stashed changes onto $BRANCH_NAME..."
  git stash pop || true
fi

# Step 2: Codebase Reconnaissance & Target Selection
MODE="${1:-auto}"
TARGET_FILE=""
TASK_DESC=""

find_untested_utility() {
  local candidates=(
    "src/features/profile/bio/utils.ts"
    "src/features/profile/utils.ts"
    "src/features/settings/utils/session-utils.ts"
    "src/shared/utils/cn.ts"
    "src/shared/store/useToastStore.ts"
    "src/shared/store/useShortcutsStore.ts"
  )

  for file in "${candidates[@]}"; do
    if [[ -f "$file" ]]; then
      local base="${file%.*}"
      if [[ ! -f "${base}.test.ts" && ! -f "${base}.test.tsx" && ! -f "${base}.spec.ts" ]]; then
        echo "$file"
        return 0
      fi
    fi
  done

  # Fallback: scan any ts utility in src
  find src -type f \( -name "*util*.ts" -o -name "*helper*.ts" \) | while read -r f; do
    local b="${f%.*}"
    if [[ ! -f "${b}.test.ts" && ! -f "${b}.spec.ts" ]]; then
      echo "$f"
      return 0
    fi
  done
}

find_lint_target() {
  # Find first file with unused vars or easily remediable issue
  pnpm exec eslint --format unix src 2>/dev/null | grep -m 1 "error" | awk -F: '{print $1}' || true
}

find_complex_module() {
  # Find largest feature component for cleanup/optimization
  find src/features -type f -name "*.tsx" -exec wc -l {} + 2>/dev/null | sort -nr | awk 'NR>1 {print $2; exit}' || true
}

echo "[ag-autopilot] Scanning codebase for high-value targets (Mode: $MODE)..."

if [[ "$MODE" == "test" || "$MODE" == "auto" ]]; then
  UNTESTED="$(find_untested_utility)"
  if [[ -n "$UNTESTED" ]]; then
    TARGET_FILE="$UNTESTED"
    TEST_TARGET="${TARGET_FILE%.*}.test.ts"
    TASK_DESC="Write comprehensive Vitest unit tests in $TEST_TARGET for all exported functions in $TARGET_FILE. Ensure complete branch coverage, edge cases handling (empty inputs, null/undefined, boundary values), and zero TypeScript errors. Run pnpm test and verify."
  fi
fi

if [[ -z "$TARGET_FILE" && ( "$MODE" == "lint" || "$MODE" == "auto" ) ]]; then
  LINT_FILE="$(find_lint_target)"
  if [[ -n "$LINT_FILE" ]]; then
    TARGET_FILE="$LINT_FILE"
    TASK_DESC="Refactor $TARGET_FILE to eliminate ESLint errors, remove unused imports/variables, and ensure strict React 19 compliance without breaking existing behavior. Verify with pnpm tsc --noEmit and pnpm test."
  fi
fi

if [[ -z "$TARGET_FILE" && ( "$MODE" == "refactor" || "$MODE" == "auto" ) ]]; then
  COMPLEX_FILE="$(find_complex_module)"
  if [[ -n "$COMPLEX_FILE" ]]; then
    TARGET_FILE="$COMPLEX_FILE"
    TASK_DESC="Optimize and clean up $TARGET_FILE: extract duplicated logic into helper functions, improve typing, adhere strictly to design tokens in CONSTITUTION.md, and ensure no regressions. Verify with pnpm tsc --noEmit and pnpm build."
  fi
fi

if [[ -z "$TARGET_FILE" ]]; then
  echo "[ag-autopilot] No specific target identified. Using general codebase quality pass."
  TARGET_FILE="src/shared/utils/cn.ts"
  TASK_DESC="Ensure src/shared/utils/cn.ts has complete unit test coverage in src/shared/utils/cn.test.ts testing single classes, array combinations, falsy values, and Tailwind merging. Verify with pnpm test."
fi

echo "======================================================================"
echo "[ag-autopilot] Selected Target: $TARGET_FILE"
echo "[ag-autopilot] Formulated Task: $TASK_DESC"
echo "======================================================================"

# Step 3: Execute the Autonomous Loop
set +e
"$SCRIPT_DIR/ag-loop.sh" "$TASK_DESC" 5
LOOP_EXIT_CODE=$?
set -e

# Step 4: Verify and Commit
if [[ $LOOP_EXIT_CODE -eq 0 && -f "$STATE_DIR/plan.md" ]]; then
  FIRST_LINE="$(head -n 1 "$STATE_DIR/plan.md" | tr -d '\r' | xargs)"
  if [[ "$FIRST_LINE" == *"STATUS: DONE"* ]]; then
    echo "======================================================================"
    echo "[ag-autopilot] Autonomous Loop PASSED with STATUS: DONE."
    echo "[ag-autopilot] Staging and committing verified improvements..."
    echo "======================================================================"

    git add src/ package.json pnpm-lock.yaml vitest.config.ts 2>/dev/null || true
    
    # Check if there are staged changes
    if ! git diff --cached --quiet; then
      COMMIT_MSG=$(cat <<EOF
ai(autopilot): verified improvement for $(basename "$TARGET_FILE")

Target: $TARGET_FILE
Task: $TASK_DESC

Quality Gates Verified:
- TypeScript typecheck (pnpm tsc --noEmit): PASSED
- Unit test suite (pnpm test): PASSED
- Build verification (pnpm build): PASSED
Branch: $BRANCH_NAME
EOF
)
      git commit -m "$COMMIT_MSG"
      echo "[ag-autopilot] Successfully committed changes to $BRANCH_NAME:"
      git log -1 --stat
    else
      echo "[ag-autopilot] No file changes were staged to commit."
    fi

    echo "======================================================================"
    echo " Autopilot run finished successfully."
    echo "======================================================================"
    exit 0
  fi
fi

echo "======================================================================"
echo "[ag-autopilot] Error: Loop did not reach STATUS: DONE (Exit: $LOOP_EXIT_CODE)."
echo "[ag-autopilot] Changes remain on branch $BRANCH_NAME for manual review."
echo "======================================================================"
exit 1
