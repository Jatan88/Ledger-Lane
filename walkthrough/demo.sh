#!/usr/bin/env bash
# One Ledger Lane scene, on main.
# Restore the retry guard, let ChangeGraph index that commit, then push the removal.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PATCH_DIR="$ROOT/walkthrough/patches"
RESTORE="$PATCH_DIR/02-restore-retry-guard.patch"
DROP="$PATCH_DIR/02-drop-retry-idempotency.patch"
PAYMENT="server/payment-service.ts"

usage() {
  cat <<'EOF'
Usage:
  ./walkthrough/demo.sh prepare [--commit] [--push]
  ./walkthrough/demo.sh apply [--commit] [--push]

Runs only on main. Does not create another branch and does not force-push.

prepare
  Put the retry guard back into server/payment-service.ts when main is
  already missing it. --commit and --push publish that baseline.
  In ChangeGraph, select main only after this commit is the tip.
  That sync indexes the shop and does not open a pull request.

apply
  Remove the retry guard. --commit and --push publish the demo commit.
  ChangeGraph reviews that push.
EOF
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
  grep -q "priorRetry" "$PAYMENT"
}

require_clean() {
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Commit or stash the current changes before the demo." >&2
    exit 1
  fi
}

commit_payment() {
  local message="$1"
  git add -- "$PAYMENT"
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
    echo "main already has the retry guard at $(git rev-parse --short HEAD)."
    echo "Select main in ChangeGraph if that commit is the tip, then run apply."
    return
  fi
  patch -p1 -i "$RESTORE"
  echo "Restored the retry guard in $PAYMENT."
  if [[ "$do_commit" -eq 1 ]]; then
    commit_payment "Restore the retry guard before the demo commit."
  elif [[ "$do_push" -eq 1 ]]; then
    echo "Refusing to push without --commit." >&2
    exit 1
  fi
  if [[ "$do_push" -eq 1 ]]; then
    push_main
  fi
  echo "Select main in ChangeGraph and wait for the sync run before apply."
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
    echo "main has no retry guard. Run: ./walkthrough/demo.sh prepare --commit --push" >&2
    exit 1
  fi
  patch -p1 -i "$DROP"
  echo "Removed the retry guard in $PAYMENT."
  if [[ "$do_commit" -eq 1 ]]; then
    commit_payment "Drop the retry guard so a second retry writes another ledger line."
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
case "$command" in
  prepare) cmd_prepare "$@" ;;
  apply) cmd_apply "$@" ;;
  *) usage; exit 1 ;;
esac
