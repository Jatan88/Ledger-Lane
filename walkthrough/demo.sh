#!/usr/bin/env bash
# Ledger Lane scenes on main.
# Restore a guard, let ChangeGraph index that commit, then push the removal.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PATCH_DIR="$ROOT/walkthrough/patches"

usage() {
  cat <<'EOF'
Usage:
  ./walkthrough/demo.sh prepare [02|01|03|04] [--commit] [--push]
  ./walkthrough/demo.sh apply [02|01|03|04] [--commit] [--push]

Runs only on main. Does not create another branch and does not force-push.
02 is the retry guard. 01 is the stock guard. 03 is the zero-reversal guard. 04 is the missing-receipt guard. The default is 02.

prepare
  Put the guard back when main is already missing it. --commit and --push
  publish that baseline. In ChangeGraph, select main only after this commit
  is the tip. That sync indexes the shop and does not open a pull request.

apply
  Remove the guard. --commit and --push publish the demo commit.
  ChangeGraph reviews that push.
EOF
}

select_scene() {
  SCENE="02"
  if [[ "${1:-}" == "01" || "${1:-}" == "02" || "${1:-}" == "03" || "${1:-}" == "04" ]]; then
    SCENE="$1"
    shift
  fi
  case "$SCENE" in
    01)
      RESTORE="$PATCH_DIR/01-restore-stock-guard.patch"
      DROP="$PATCH_DIR/01-drop-stock-guard.patch"
      FILE="server/inventory-service.ts"
      MARKER="available < quantity"
      RESTORE_MESSAGE="Restore the stock guard before the demo commit."
      DROP_MESSAGE="Drop the stock guard so checkout can sell past the shelf."
      LABEL="stock guard"
      ;;
    02)
      RESTORE="$PATCH_DIR/02-restore-retry-guard.patch"
      DROP="$PATCH_DIR/02-drop-retry-idempotency.patch"
      FILE="server/payment-service.ts"
      MARKER="priorRetry"
      RESTORE_MESSAGE="Restore the retry guard before the demo commit."
      DROP_MESSAGE="Drop the retry guard so a second retry writes another ledger line."
      LABEL="retry guard"
      ;;
    03)
      RESTORE="$PATCH_DIR/03-restore-zero-reversal.patch"
      DROP="$PATCH_DIR/03-drop-zero-reversal.patch"
      FILE="server/ledger-service.ts"
      MARKER="amountCents === 0"
      RESTORE_MESSAGE="Restore the zero-reversal guard before the demo commit."
      DROP_MESSAGE="Drop the zero-reversal guard so an unknown refund still posts a reversal."
      LABEL="zero-reversal guard"
      ;;
    04)
      RESTORE="$PATCH_DIR/04-restore-missing-receipt.patch"
      DROP="$PATCH_DIR/04-drop-missing-receipt.patch"
      FILE="server/checkout-controller.ts"
      MARKER="order: null"
      RESTORE_MESSAGE="Restore the missing-receipt guard before the demo commit."
      DROP_MESSAGE="Drop the missing-receipt guard so an unknown order falls through."
      LABEL="missing-receipt guard"
      ;;
  esac
  ARGS=("$@")
}

require_main() {
  local branch
  branch="$(git branch --show-current)"
  if [[ "$branch" != "main" ]]; then
    echo "This demo runs on main. The current branch is $branch." >&2
    exit 1
  fi
}

guard_present() {
  grep -q "$MARKER" "$FILE"
}

require_clean() {
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Commit or stash the current changes before the demo." >&2
    exit 1
  fi
}

commit_file() {
  local message="$1"
  git add -- "$FILE"
  git commit -m "$(cat <<EOF
$message
EOF
)"
  echo "Committed on main: $(git rev-parse --short HEAD)"
}

push_main() {
  git push origin main
  echo "Pushed main."
}

cmd_prepare() {
  local do_commit=0 do_push=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --commit) do_commit=1 ;;
      --push) do_push=1 ;;
      *)
        echo "Unknown option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
    shift
  done
  require_main
  require_clean
  if guard_present; then
    echo "main already has the $LABEL at $(git rev-parse --short HEAD)."
    echo "Select main in ChangeGraph if that commit is the tip, then run apply $SCENE."
    return
  fi
  patch -p1 -i "$RESTORE"
  echo "Restored the $LABEL in $FILE."
  if [[ "$do_commit" -eq 1 ]]; then
    commit_file "$RESTORE_MESSAGE"
  elif [[ "$do_push" -eq 1 ]]; then
    echo "Refusing to push without --commit." >&2
    exit 1
  fi
  if [[ "$do_push" -eq 1 ]]; then
    push_main
  fi
  echo "Select main in ChangeGraph and wait for the sync run before apply $SCENE."
}

cmd_apply() {
  local do_commit=0 do_push=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --commit) do_commit=1 ;;
      --push) do_push=1 ;;
      *)
        echo "Unknown option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
    shift
  done
  require_main
  require_clean
  if ! guard_present; then
    echo "main has no $LABEL. Run: ./walkthrough/demo.sh prepare $SCENE --commit --push" >&2
    exit 1
  fi
  patch -p1 -i "$DROP"
  echo "Removed the $LABEL in $FILE."
  if [[ "$do_commit" -eq 1 ]]; then
    commit_file "$DROP_MESSAGE"
  elif [[ "$do_push" -eq 1 ]]; then
    echo "Refusing to push without --commit." >&2
    exit 1
  fi
  if [[ "$do_push" -eq 1 ]]; then
    push_main
    echo "ChangeGraph reviews this commit on main."
  fi
}

command="${1:-}"
shift || true
select_scene "$@"
set -- "${ARGS[@]}"
case "$command" in
  prepare) cmd_prepare "$@" ;;
  apply) cmd_apply "$@" ;;
  *) usage; exit 1 ;;
esac
