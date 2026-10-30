#!/usr/bin/env bash
# Fails when the branch changes application code without touching
# CHANGELOG.md. Application code: anything under src/ except tests
# (*.test.*, src/test/), plus the files that change the build or the served
# app (package.json, vite.config.ts, index.html, nginx.conf, Dockerfile).
# Every such change gets an entry under "## [Unreleased]".
#
# Usage: scripts/check-changelog.sh [BASE]   (BASE: see scripts/changed-files.sh)
set -euo pipefail

changed="$("$(dirname "$0")/changed-files.sh" "$@")"

code="$(grep -E '^(src/|package\.json$|vite\.config\.ts$|index\.html$|nginx\.conf$|Dockerfile$)' <<<"$changed" \
  | grep -vE '\.test\.[jt]sx?$|^src/test/' || true)"
if [ -z "$code" ]; then
  echo "check-changelog: no application code changed"
  exit 0
fi

if ! grep -qx 'CHANGELOG.md' <<<"$changed"; then
  echo "check-changelog: application code changed without a CHANGELOG.md entry:" >&2
  sed 's/^/  /' <<<"$code" >&2
  echo "Add an entry under '## [Unreleased]' in CHANGELOG.md." >&2
  exit 1
fi

if ! grep -q '^## \[Unreleased\]' CHANGELOG.md; then
  echo "check-changelog: CHANGELOG.md has no '## [Unreleased]' section" >&2
  exit 1
fi

echo "check-changelog: ok"
