#!/usr/bin/env bash
# Dry-runs the scripts that send a waiting PR back to the developer against the
# cases in scripts/fixtures/: conflict-bounce.sh (conflict/, issue #168) and
# checks-bounce.sh (checks/). There is no E2E layer for pipeline scripts, so each
# acceptance criterion is one fixture directory.
#
# Contract a script must meet when its fixtures variable (CONFLICT_FIXTURES or
# CHECKS_FIXTURES) is <case dir> and DRY_RUN=1:
#   - open PRs come from <case>/prs.json (the shape of `gh pr list --json …`)
#   - labels and comments of issue <n> come from <case>/issues/<n>.json (the shape of
#     `gh issue view <n> --json labels,comments`)
#   - conflict-bounce.sh: the conflicting files of PR <p> come from
#     <case>/files/<p>.txt, one path per line (in production: git merge-tree)
#   - checks-bounce.sh: the check runs of commit <sha> come from
#     <case>/checks/<sha>.json (the shape of the check-runs API), the jobs of run
#     <id> from <case>/runs/<id>.json (`gh run view --json jobs`) and its failed
#     tests from <case>/failures/<id>/ci-failures.md
#   - every gh command that changes something is printed as
#     `DRY_RUN: gh <args>` instead of run, with the comment written to a file in
#     the current directory and its lines printed right after the command, each
#     prefixed with `| `
#   - anything it skips is logged on stdout without those prefixes
#   - BRANCH unset means `--ref main`
#
# Per case: expected.txt is the `DRY_RUN:` lines plus the `| ### ` heading line;
# expected-body.txt (optional) lists strings the comment body must contain;
# expected-log.txt (optional) lists strings the skip log must contain; env
# (optional) holds VAR=value lines to run the script with.
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
failed=0

fail() {
	echo "FAIL $1: $2"
	failed=1
}

# run_cases <script> <fixtures dir> <fixtures variable>
run_cases() {
	local script=$root/scripts/$1 variable=$3 dir name work out want
	local extra
	if [[ ! -f $script ]]; then
		fail "$1" "$script does not exist"
		return
	fi
	for dir in "$root/scripts/fixtures/$2"/*/; do
		name=$2/$(basename "$dir")
		work=$(mktemp -d)
		out=$work/out.txt
		extra=()
		if [[ -f $dir/env ]]; then
			while IFS= read -r want; do extra+=("$want"); done < "$dir/env"
		fi
		if ! (cd "$work" && env -u BRANCH GH_REPO=o/r "$variable=${dir%/}" DRY_RUN=1 ${extra[@]+"${extra[@]}"} bash "$script" > "$out" 2>&1); then
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
}

run_cases conflict-bounce.sh conflict CONFLICT_FIXTURES
run_cases checks-bounce.sh checks CHECKS_FIXTURES

if [[ $failed -eq 0 ]]; then
	echo "bounce fixtures ok"
fi
exit $failed
