#!/usr/bin/env bash
# Prints the files this branch changes against BASE, one per line: committed
# changes since the merge base, plus staged, unstaged and untracked files, so
# the checks see the same change before and after the commit. Deleted files
# are left out.
#
# Usage: scripts/changed-files.sh [--merge-base] [BASE]
#   BASE defaults to $BASE, then `git config kinerja.base`, then origin/HEAD,
#   then origin/production.
#   --merge-base prints the merge-base commit instead of the files.
set -euo pipefail

print_merge_base=false
if [ "${1:-}" = "--merge-base" ]; then
  print_merge_base=true
  shift
fi

base="${1:-${BASE:-}}"
if [ -z "$base" ]; then
  base="$(git config --get kinerja.base 2>/dev/null || true)"
fi
if [ -z "$base" ]; then
  base="$(git rev-parse --abbrev-ref origin/HEAD 2>/dev/null || true)"
fi
if [ -z "$base" ] || [ "$base" = "origin/HEAD" ]; then
  base="origin/production"
fi
if ! git rev-parse --verify --quiet "$base^{commit}" >/dev/null; then
  echo "changed-files: base '$base' not found; set it once with git config kinerja.base origin/<base-branch>, or pass BASE=origin/<base-branch>" >&2
  exit 2
fi

merge_base="$(git merge-base "$base" HEAD)"
if $print_merge_base; then
  echo "$merge_base"
  exit 0
fi

{
  git diff --name-only --diff-filter=d "$merge_base"
  git ls-files --others --exclude-standard
} | sort -u
