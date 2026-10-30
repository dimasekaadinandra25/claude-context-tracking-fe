#!/usr/bin/env bash
# Fails when the branch changes how the app calls the backend without the
# matching API document, and when a changed API document keeps its old
# "**Last Updated:**" line:
#   src/module/<domain>/features/<feature>/api/**   ->  docs/api/<feature>.md
#   src/**/services/**, src/shared/api/**,
#   src/shared/lib/axios.ts (endpoints)            ->  docs/api/**
# Test files do not count. A change that leaves the contract as it is (a pure
# refactor) runs with DOC_SYNC_SKIP=1; CI sets it from the PR label
# "no-doc-change".
#
# Usage: scripts/check-doc-sync.sh [BASE]   (BASE: see scripts/changed-files.sh)
set -euo pipefail

if [ "${DOC_SYNC_SKIP:-}" = "1" ] || [ "${DOC_SYNC_SKIP:-}" = "true" ]; then
  echo "check-doc-sync: skipped (DOC_SYNC_SKIP)"
  exit 0
fi

here="$(dirname "$0")"
changed="$("$here/changed-files.sh" "$@")"
merge_base="$("$here/changed-files.sh" --merge-base "$@")"
missing=()

touched() { grep -qE "$1" <<<"$changed"; }

while IFS= read -r file; do
  [ -z "$file" ] && continue
  if [[ "$file" =~ \.test\.[jt]sx?$ || "$file" =~ ^src/test/ ]]; then
    continue
  fi
  if [[ "$file" =~ ^src/module/[^/]+/features/([^/]+)/api/ ]]; then
    doc="docs/api/${BASH_REMATCH[1]}.md"
    touched "^${doc//./\\.}$" || missing+=("$file -> $doc")
  elif [[ "$file" =~ ^src/(.+/)?(api|services?)/ || "$file" == "src/shared/lib/axios.ts" ]]; then
    touched '^docs/api/' || missing+=("$file -> docs/api/")
  fi
done <<<"$changed"

stale=()
while IFS= read -r doc; do
  if [ -z "$doc" ] || [ ! -f "$doc" ] || [ "$doc" = "docs/api/README.md" ]; then
    continue
  fi
  if git ls-files --error-unmatch "$doc" >/dev/null 2>&1; then
    git diff "$merge_base" -- "$doc" | grep -q '^+\*\*Last Updated:\*\*' || stale+=("$doc")
  else
    grep -q '^\*\*Last Updated:\*\*' "$doc" || stale+=("$doc")
  fi
done < <(grep -E '^docs/api/.*\.md$' <<<"$changed" || true)

if [ ${#missing[@]} -gt 0 ]; then
  echo "check-doc-sync: changed without the matching API document:" >&2
  printf '  %s\n' "${missing[@]}" >&2
fi
if [ ${#stale[@]} -gt 0 ]; then
  echo "check-doc-sync: API document changed but its '**Last Updated:**' line was not updated:" >&2
  printf '  %s\n' "${stale[@]}" >&2
fi
if [ ${#missing[@]} -gt 0 ] || [ ${#stale[@]} -gt 0 ]; then
  echo "See .claude/rules/api-docs.md. A pure refactor that leaves the contract as is: DOC_SYNC_SKIP=1 (PR label no-doc-change)." >&2
  exit 1
fi

echo "check-doc-sync: ok"
