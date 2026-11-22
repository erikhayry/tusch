#!/usr/bin/env bash
# Merges a ref (main) into the checked-out branch and resolves the conflicts that
# need no judgement, so a waiting PR doesn't go back to an agent for them:
#
#   messages/*.json        merged per key (scripts/merge-json.mjs)
#   docs/requirements.md   both sides' lines are kept (git's union merge);
#                          check:requirements then catches a real clash
#
#   merge-main.sh <ref>
#
# Prints one line per outcome: `up-to-date`, `merged`, or `conflict:<path>` for each
# file it can't resolve.
# Exits 0 with the merge committed (or nothing to do), and 3 with the merge aborted
# and the branch untouched. Needs a committer identity (git config user.*).
#
# The merge drivers are registered in this clone only (.git/config and
# .git/info/attributes), not in .gitattributes: a driver named there but missing
# from a developer's config would silently fall back to a normal merge.
set -euo pipefail

ref=${1:?usage: merge-main.sh <ref>}
root=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

if git merge-base --is-ancestor "$ref" HEAD; then
	echo up-to-date
	exit 0
fi

git config merge.tusch-json.name 'Per-key merge of flat JSON maps'
git config merge.tusch-json.driver "node '$root/merge-json.mjs' %O %A %B"
attributes=$(git rev-parse --git-path info/attributes)
mkdir -p "$(dirname "$attributes")"
printf '%s\n' 'messages/*.json merge=tusch-json' 'docs/requirements.md merge=union' > "$attributes"

branch=$(git branch --show-current)
message="Merge ${ref#origin/} into ${branch:-HEAD}"

if git merge --no-ff --no-commit "$ref" > /dev/null 2>&1; then
	git commit --quiet --no-verify -m "$message"
	echo merged
	exit 0
fi

unresolved=()
while IFS= read -r file; do
	unresolved+=("$file")
done < <(git diff --name-only --diff-filter=U)

if [[ ${#unresolved[@]} -gt 0 ]]; then
	git merge --abort
	printf 'conflict:%s\n' "${unresolved[@]}"
	exit 3
fi

git commit --quiet --no-verify -m "$message" \
	-m "Resolved by the pipeline (scripts/merge-main.sh): messages merged per key, requirements by keeping both sides."
echo merged
