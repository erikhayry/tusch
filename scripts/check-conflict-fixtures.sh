#!/usr/bin/env bash
# Dry-runs scripts/conflict-bounce.sh against every case in
# scripts/fixtures/conflict/ (issue #168). There is no E2E layer for pipeline
# scripts, so each acceptance criterion is one fixture directory.
#
# Contract the script must meet when CONFLICT_FIXTURES=<case dir> and DRY_RUN=1:
#   - open PRs come from <case>/prs.json (the shape of
#     `gh pr list --json number,headRefName,mergeable`)
#   - labels and comments of issue <n> come from <case>/issues/<n>.json (the shape of
#     `gh issue view <n> --json labels,comments`)
#   - the conflicting files of PR <p> come from <case>/files/<p>.txt, one path
#     per line (in production: git merge-tree)
#   - every gh command that changes something is printed as
#     `DRY_RUN: gh <args>` instead of run, with the comment written to
#     `conflict-comment.md` (in the current directory) and its lines printed
#     right after the command, each prefixed with `| `
#   - anything it skips is logged on stdout without those prefixes
#   - BRANCH unset means `--ref main`
#
# Per case: expected.txt is the `DRY_RUN:` lines plus the `| ### ` heading line;
# expected-body.txt (optional) lists strings the comment body must contain;
# expected-log.txt (optional) lists strings the skip log must contain.
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
script=$root/scripts/conflict-bounce.sh
failed=0

fail() {
	echo "FAIL $1: $2"
	failed=1
}

if [[ ! -f $script ]]; then
	echo "FAIL: $script does not exist"
	exit 1
fi

for dir in "$root"/scripts/fixtures/conflict/*/; do
	name=$(basename "$dir")
	work=$(mktemp -d)
	out=$work/out.txt
	if ! (cd "$work" && env -u BRANCH CONFLICT_FIXTURES="${dir%/}" DRY_RUN=1 bash "$script" > "$out" 2>&1); then
		fail "$name" "script exited non-zero"
		sed 's/^/  /' "$out"
		continue
	fi
	if ! diff -u "$dir/expected.txt" <(grep -E '^(DRY_RUN: |\| ### )' "$out"); then
		fail "$name" "commands differ from expected.txt"
	fi
	if [[ -f $dir/expected-body.txt ]]; then
		while IFS= read -r want; do
			grep -E '^\| ' "$out" | grep -qF -- "$want" || fail "$name" "comment body lacks: $want"
		done < "$dir/expected-body.txt"
	fi
	if [[ -f $dir/expected-log.txt ]]; then
		while IFS= read -r want; do
			grep -vE '^(DRY_RUN: |\| )' "$out" | grep -qF -- "$want" || fail "$name" "log lacks: $want"
		done < "$dir/expected-log.txt"
	fi
	rm -rf "$work"
done

if [[ $failed -eq 0 ]]; then
	echo "conflict fixtures ok"
fi
exit $failed
