#!/usr/bin/env bash
# Lints the JS/TS files under src/ that this branch changes, with
# --max-warnings 0, and checks their Prettier formatting. The Kinerja
# thresholds in eslint.config.mjs are warnings, so `yarn lint` (whole src/)
# passes with the old backlog, while here every warning in a changed file
# fails the run.
#
# Usage: scripts/lint-changed.sh [BASE]   (BASE: see scripts/changed-files.sh)
set -euo pipefail

files=()
while IFS= read -r file; do
  [ -n "$file" ] && files+=("$file")
done < <("$(dirname "$0")/changed-files.sh" "$@" | grep -E '^src/.*\.(js|jsx|ts|tsx)$' || true)

if [ ${#files[@]} -eq 0 ]; then
  echo "lint-changed: no JS/TS file under src/ changed"
  exit 0
fi

bin="$(git rev-parse --show-toplevel)/node_modules/.bin"
echo "lint-changed: ${#files[@]} file(s)"
"$bin/eslint" --max-warnings 0 "${files[@]}"
"$bin/prettier" --check "${files[@]}"
echo "lint-changed: ok"
