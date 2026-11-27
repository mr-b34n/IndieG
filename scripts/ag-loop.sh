#!/usr/bin/env bash
# ==============================================================================
# Autonomous Agentic Loop Orchestrator (ag-loop.sh)
# Architecture: Code -> Test -> Critique -> Plan Improve -> Code
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKFLOW_DIR="$PROJECT_ROOT/.ag_workflow"
STATE_DIR="$WORKFLOW_DIR/state"
PROMPTS_DIR="$WORKFLOW_DIR/prompts"

# Ensure state and workflow directories exist
mkdir -p "$STATE_DIR" "$PROMPTS_DIR"

# Locate CLI binary
CLI_BIN="$(command -v agy 2>/dev/null || command -v antigravity 2>/dev/null || echo "/home/b34n/.local/bin/agy")"
if [[ ! -x "$CLI_BIN" ]]; then
  echo "[ag-loop] Error: Antigravity/AGY CLI binary not found or not executable." >&2
  exit 1
fi

MODEL_FLAG="--model gemini-3.8-flash-high"

TASK_DESC="${1:-}"
MAX_LOOPS="${2:-5}"

if [[ -z "$TASK_DESC" ]]; then
  echo "Usage: $0 \"<task description>\" [max_loops]"
  echo "Example: $0 \"Add unit test for formatTimeAgo utility\" 5"
  exit 1
fi

echo "======================================================================"
echo " Starting Autonomous Agentic Loop"
echo " Task: $TASK_DESC"
echo " CLI:  $CLI_BIN ($MODEL_FLAG)"
echo " Max Iterations: $MAX_LOOPS"
echo "======================================================================"

# Step 1: Initialize the Plan
cat <<EOF > "$STATE_DIR/plan.md"
STATUS: IN_PROGRESS
# Task Objective
$TASK_DESC

## Initial Plan
1. Analyze relevant code and identify requirements or bugs.
2. Implement necessary changes following .ag_workflow/CONSTITUTION.md.
3. Write or update unit tests to verify behavior.
4. Prepare implementation for testing and senior review.
EOF

for ((iter=1; iter<=MAX_LOOPS; iter++)); do
  echo ""
  echo "----------------------------------------------------------------------"
  echo ">>> [Iteration $iter / $MAX_LOOPS] STEP 2: CODING PHASE"
  echo "----------------------------------------------------------------------"

  CODER_SYSTEM_PROMPT="$(cat "$PROMPTS_DIR/coder.md")"
  CURRENT_PLAN="$(cat "$STATE_DIR/plan.md")"

  CODER_INPUT=$(cat <<EOF
$CODER_SYSTEM_PROMPT

======================================================================
ACTIVE WORKFLOW DIRECTORY: $PROJECT_ROOT/.ag_workflow
CURRENT PLAN (.ag_workflow/state/plan.md):
======================================================================
$CURRENT_PLAN
======================================================================

Instruction: Read the plan and relevant files, then implement or fix the necessary code directly. Follow .ag_workflow/CONSTITUTION.md. Do not edit plan.md.
EOF
)

  echo "[ag-loop] Invoking Coder agent..."
  "$CLI_BIN" -p "$CODER_INPUT" $MODEL_FLAG --dangerously-skip-permissions

  echo ""
  echo "----------------------------------------------------------------------"
  echo ">>> [Iteration $iter / $MAX_LOOPS] STEP 3: TEST & VERIFY PHASE"
  echo "----------------------------------------------------------------------"

  TEST_LOG="$STATE_DIR/test_output.log"
  DIFF_FILE="$STATE_DIR/current.diff"
  : > "$TEST_LOG"

  echo "=== QUALITY GATE 1: TypeScript Check (pnpm tsc --noEmit) ===" >> "$TEST_LOG"
  TSC_STATUS=0
  pnpm tsc --noEmit >> "$TEST_LOG" 2>&1 || TSC_STATUS=$?
  echo "TSC Exit Code: $TSC_STATUS" >> "$TEST_LOG"

  echo -e "\n=== QUALITY GATE 2: Unit Tests (pnpm test) ===" >> "$TEST_LOG"
  TEST_STATUS=0
  pnpm test >> "$TEST_LOG" 2>&1 || TEST_STATUS=$?
  echo "Test Exit Code: $TEST_STATUS" >> "$TEST_LOG"

  echo -e "\n=== QUALITY GATE 3: Build Verification (pnpm build) ===" >> "$TEST_LOG"
  BUILD_STATUS=0
  pnpm build >> "$TEST_LOG" 2>&1 || BUILD_STATUS=$?
  echo "Build Exit Code: $BUILD_STATUS" >> "$TEST_LOG"

  echo "[ag-loop] Test runs completed. Capturing git diff..."
  git diff > "$DIFF_FILE" || true
  git status --short >> "$DIFF_FILE" || true

  echo "[ag-loop] Gates summary: TSC=$TSC_STATUS, Tests=$TEST_STATUS, Build=$BUILD_STATUS"

  echo ""
  echo "----------------------------------------------------------------------"
  echo ">>> [Iteration $iter / $MAX_LOOPS] STEP 4: CRITIQUE & PLAN IMPROVE"
  echo "----------------------------------------------------------------------"

  CRITIC_SYSTEM_PROMPT="$(cat "$PROMPTS_DIR/critic.md")"
  PLAN_CONTENT="$(cat "$STATE_DIR/plan.md")"
  DIFF_SUMMARY="$(head -n 250 "$DIFF_FILE")"
  TEST_LOG_SUMMARY="$(tail -n 250 "$TEST_LOG")"

  CRITIC_INPUT=$(cat <<EOF
$CRITIC_SYSTEM_PROMPT

======================================================================
FILES AVAILABLE ON DISK:
- Test output log: $TEST_LOG
- Git diff: $DIFF_FILE
- Current plan: $STATE_DIR/plan.md
- Constitution: $PROJECT_ROOT/.ag_workflow/CONSTITUTION.md
======================================================================

CURRENT PLAN:
$PLAN_CONTENT

TEST RESULTS PREVIEW (TSC=$TSC_STATUS, Tests=$TEST_STATUS, Build=$BUILD_STATUS):
$TEST_LOG_SUMMARY

GIT DIFF PREVIEW:
$DIFF_SUMMARY
======================================================================
Review the code, test results, and constitution.
Evaluate thoroughly.
Update $STATE_DIR/plan.md with your verdict.
If and ONLY IF all gates pass and code meets production standards, put 'STATUS: DONE' on line 1.
Otherwise, provide a clear remediation plan and keep STATUS: IN_PROGRESS.
EOF
)

  echo "[ag-loop] Invoking Critic agent..."
  "$CLI_BIN" -p "$CRITIC_INPUT" $MODEL_FLAG --dangerously-skip-permissions

  echo ""
  echo "----------------------------------------------------------------------"
  echo ">>> [Iteration $iter / $MAX_LOOPS] STEP 5: EVALUATE EXIT STATUS"
  echo "----------------------------------------------------------------------"

  if [[ ! -f "$STATE_DIR/plan.md" ]]; then
    echo "[ag-loop] Warning: plan.md was not found after critique step!"
    continue
  fi

  FIRST_LINE="$(head -n 1 "$STATE_DIR/plan.md" | tr -d '\r' | xargs)"
  echo "[ag-loop] Plan Status Line: '$FIRST_LINE'"

  if [[ "$FIRST_LINE" == "STATUS: DONE" ]] || [[ "$FIRST_LINE" == *"STATUS: DONE"* ]]; then
    echo "======================================================================"
    echo " SUCCESS: Autonomous Loop finished with STATUS: DONE at iteration $iter"
    echo "======================================================================"
    cat "$STATE_DIR/plan.md"
    exit 0
  fi

  echo "[ag-loop] Task still in progress. Advancing to iteration $((iter + 1))..."
done

echo "======================================================================"
echo " [ag-loop] Reached maximum iterations ($MAX_LOOPS) without reaching STATUS: DONE."
echo " Final plan state:"
cat "$STATE_DIR/plan.md"
echo "======================================================================"
exit 1
