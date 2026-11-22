#!/usr/bin/env bash
# Reacts to a finished CI run on main, so a red main is never left for a human to
# notice. No AI in this script.
#
#   main-health.sh
#
# Run by pipeline.yml's `main` job with the run in the environment: CONCLUSION,
# RUN_ID, RUN_ATTEMPT, RUN_URL and HEAD_SHA.
#
#   failure, first attempt   re-runs the failed jobs once: a pass on the second
#                            attempt is a flaky test, which the weekly audit lists
#   failure again            opens one issue labelled `main-broken` (type:bug,
#                            status:idea) with the failed steps and tests, and
#                            dispatches /plan for it; while that issue is open,
#                            later failures only add a comment
#   success                  closes the open `main-broken` issue, if any
#
# Needs gh (GH_TOKEN, GH_REPO) and node. DRY_RUN=1 prints changes instead of
# making them; MAIN_OPEN_ISSUE replaces the lookup of the open issue (for
# check-main-health.sh).
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$root/bounce-lib.sh"

label=main-broken
base=${BRANCH:-main}

open_issue() {
	if [[ -n ${MAIN_OPEN_ISSUE+set} ]]; then
		echo "$MAIN_OPEN_ISSUE"
	else
		gh issue list --state open --label "$label" --limit 1 --json number --jq '.[0].number // empty'
	fi
}

failed_steps() {
	gh run view "$RUN_ID" --json jobs --jq '.jobs[].steps[] | select(.conclusion == "failure") | "- \(.name)"' 2> /dev/null || true
}

failed_tests() {
	local dir
	dir=$(mktemp -d)
	gh run download "$RUN_ID" --name ci-failures --dir "$dir" > /dev/null 2>&1 || true
	if [[ -s $dir/ci-failures.md ]]; then
		head -n 60 "$dir/ci-failures.md"
	fi
}

existing=$(open_issue)
body=$(mktemp -d)/main-health.md

case "$CONCLUSION" in
	success)
		if [[ -z $existing ]]; then
			echo "main is green; nothing to do."
			exit 0
		fi
		printf '### Pipeline: `%s` is green again\n\nCI passed on %s: %s\n' "$base" "$HEAD_SHA" "$RUN_URL" > "$body"
		bounce_gh issue comment "$existing" --body-file "$body"
		bounce_gh issue close "$existing"
		;;
	failure | timed_out)
		if [[ "$RUN_ATTEMPT" -le 1 ]]; then
			echo "CI failed on $base; re-running the failed jobs once to rule out a flaky test."
			bounce_gh run rerun "$RUN_ID" --failed
			exit 0
		fi
		if [[ -n $existing ]]; then
			printf '### Pipeline: `%s` is still broken\n\nCI failed again, on %s: %s\n' "$base" "$HEAD_SHA" "$RUN_URL" > "$body"
			bounce_gh issue comment "$existing" --body-file "$body"
			exit 0
		fi
		{
			echo "CI fails on \`$base\`, twice in a row on the same commit (so it isn't a flaky test): $RUN_URL"
			echo
			echo "Commit: $HEAD_SHA"
			echo
			echo '**Failed steps**'
			echo
			if [[ -z ${DRY_RUN:-} ]]; then failed_steps; fi
			echo
			if [[ -z ${DRY_RUN:-} ]]; then failed_tests; fi
			echo
			echo '## Acceptance criteria'
			echo
			echo "- [ ] Every CI step passes on \`$base\` again."
			echo '- [ ] No test or requirement is weakened or removed to get there; the failing test is the reproduction.'
			echo
			echo 'Filed by `scripts/main-health.sh`. It closes by itself when CI passes on `main`.'
		} > "$body"
		# The label may not exist yet in a repo that hasn't synced labels.yml.
		bounce_gh label create "$label" --color B60205 --description "CI fails on main" --force
		if [[ -n ${DRY_RUN:-} ]]; then
			bounce_gh issue create --title "CI fails on $base" --label type:bug --label "$label" --label status:idea --body-file "$body"
			exit 0
		fi
		url=$(gh issue create --title "CI fails on $base" --label type:bug --label "$label" --label status:idea --body-file "$body")
		echo "Filed $url"
		# A label set with GITHUB_TOKEN starts no run, so start the planner by dispatch.
		gh workflow run agents.yml --ref "$base" -f issue="${url##*/}"
		;;
	*)
		echo "CI ended as '$CONCLUSION' on $base; nothing to do."
		;;
esac
