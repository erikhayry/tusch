#!/usr/bin/env bash
# Sends a waiting pipeline PR back to the developer when a check on its newest
# commit failed: CI's `test` job, or the SonarCloud analysis. No AI.
#
#   checks-bounce.sh
#
# Run by pipeline.yml's `prs` job when a CI run completes and on the schedule. It
# scans every open PR on a branch issue-<n>-… whose issue waits for the human
# (status:needs-human) and reads the check runs of the PR's head commit:
#
#   `test` still running    left alone; the next run looks again
#   `test` failed           comments the failed steps and tests on the issue, moves
#                           it to status:needs-dev and dispatches /develop
#   SonarCloud failed       scripts/sonar-bounce.sh does the same with its findings
#
# A commit is bounced once: the comment ends with `<!-- bounced:<sha> -->`, and a
# commit that carries the marker is skipped, so moving a blocked issue back to
# status:needs-human by hand doesn't bounce it again. After MAX_ROUNDS CI bounces
# the issue is blocked instead.
#
# Needs gh (GH_TOKEN, GH_REPO) and node. With CHECKS_FIXTURES=<case dir> everything
# is read from that directory, and with DRY_RUN=1 changes are printed, not made;
# the contract is in check-bounce-fixtures.sh.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$root/bounce-lib.sh"

max_rounds=${MAX_ROUNDS:-2}
marker='### Pipeline: CI failed'
fixtures=${CHECKS_FIXTURES:-}
# The longest list of failed tests worth quoting; the run has the rest.
max_failure_lines=60

open_prs() {
	if [[ -n $fixtures ]]; then
		cat "$fixtures/prs.json"
	else
		gh pr list --state open --limit 500 --json number,headRefName,headRefOid,isCrossRepository
	fi
}

issue_json() {
	if [[ -n $fixtures ]]; then
		cat "$fixtures/issues/$1.json"
	else
		gh issue view "$1" --json labels,comments
	fi
}

# Prints "<test> <sonar> <run id>" for commit $1: the state of the newest `test`
# check run (none, pending, or its conclusion), the same for SonarCloud, and the
# id of the workflow run behind `test`.
check_state() {
	if [[ -n $fixtures ]]; then
		cat "$fixtures/checks/$1.json"
	else
		gh api "repos/$GH_REPO/commits/$1/check-runs?per_page=100"
	fi | node -e '
		const runs = JSON.parse(require("fs").readFileSync(0, "utf8")).check_runs ?? [];
		const newest = (list) => list.sort((a, b) => b.id - a.id)[0];
		const state = (run) => (!run ? "none" : run.status === "completed" ? run.conclusion : "pending");
		const test = newest(runs.filter((r) => r.name === "test" && r.app?.slug === "github-actions"));
		const sonar = newest(runs.filter((r) => r.app?.slug === "sonarqubecloud"));
		const id = /\/actions\/runs\/(\d+)/.exec(test?.html_url ?? "")?.[1] ?? "";
		console.log([state(test), state(sonar), id].join(" "));
	'
}

# Prints the names of the failed steps of workflow run $1, one per line.
failed_steps() {
	if [[ -n $fixtures ]]; then
		cat "$fixtures/runs/$1.json"
	else
		gh run view "$1" --json jobs
	fi | node -e '
		const { jobs = [] } = JSON.parse(require("fs").readFileSync(0, "utf8"));
		for (const job of jobs) for (const step of job.steps ?? []) if (step.conclusion === "failure") console.log(step.name);
	'
}

# Prints the failed tests of workflow run $1 (CI uploads them as `ci-failures`);
# nothing when a step before the tests failed.
failed_tests() {
	local dir
	if [[ -n $fixtures ]]; then
		dir=$fixtures/failures/$1
	else
		dir=$(mktemp -d)
		gh run download "$1" --name ci-failures --dir "$dir" > /dev/null 2>&1 || true
	fi
	if [[ -s $dir/ci-failures.md ]]; then
		head -n "$max_failure_lines" "$dir/ci-failures.md"
	fi
}

bounce_ci() {
	local issue=$1 pr=$2 branch=$3 run=$4 json=$5 rounds steps tests
	rounds=$(bounce_rounds "$marker" "$json")
	steps=$(failed_steps "$run") || steps=''
	tests=$(failed_tests "$run")
	{
		echo "$marker (round $((rounds + 1)) of $max_rounds)"
		echo
		echo "The \`test\` check failed on PR #$pr (\`$branch\`): https://github.com/${GH_REPO:-}/actions/runs/$run"
		echo
		if [[ -n $steps ]]; then
			echo '**Failed steps**'
			echo
			printf '%s\n' "$steps" | sed 's/^/- /'
			echo
		fi
		if [[ -n $tests ]]; then
			printf '%s\n\n' "$tests"
		fi
		if [[ "$rounds" -ge "$max_rounds" ]]; then
			echo "This failed $rounds times already, so the issue is **blocked**: a human needs to look at the run."
		else
			echo 'Developer: reproduce the failure, fix it on the branch without weakening a test, run the usual checks, push, and hand off to review as usual. A failed screenshot test after a merge means the baselines need `pnpm screenshots:update`.'
		fi
	} > checks-comment.md
	bounce_comment "$issue" checks-comment.md
	bounce_hand_off "$issue" "$rounds" "$max_rounds"
}

bounce_sonar() {
	local issue=$1 pr=$2
	if [[ -n $fixtures ]]; then
		echo "DRY_RUN: sonar-bounce.sh $issue $pr"
	else
		"$root/sonar-bounce.sh" "$issue" "$pr"
	fi
}

while IFS=$'\t' read -r pr branch sha; do
	if [[ ! $branch =~ ^issue-([0-9]+)- ]]; then
		echo "PR #$pr is on $branch, not an issue-<n> branch; left alone."
		continue
	fi
	issue=${BASH_REMATCH[1]}

	json=$(issue_json "$issue") || {
		echo "Could not read issue #$issue for PR #$pr; skipped."
		continue
	}
	bounce_is_waiting "$issue" "$json" || continue

	export BOUNCE_FOOTER="<!-- bounced:$sha -->"
	if printf '%s' "$json" | grep -qF -- "$BOUNCE_FOOTER"; then
		echo "PR #$pr: $sha was bounced before; left for the human."
		continue
	fi

	read -r test sonar run < <(check_state "$sha") || {
		echo "Could not read the checks of PR #$pr; skipped."
		continue
	}
	case "$test" in
		failure | timed_out)
			echo "PR #$pr: test $test on $sha."
			bounce_ci "$issue" "$pr" "$branch" "$run" "$json"
			;;
		success)
			if [[ $sonar == failure ]]; then
				echo "PR #$pr: SonarCloud failed on $sha."
				bounce_sonar "$issue" "$pr"
			else
				echo "PR #$pr: checks passed on $sha."
			fi
			;;
		*)
			# Not started, still running, or cancelled by a newer run: wait for a result.
			echo "PR #$pr: test is $test on $sha; nothing to do yet."
			;;
	esac
done < <(open_prs | node -e '
	const prs = JSON.parse(require("fs").readFileSync(0, "utf8"));
	// A fork may name its branch issue-<n>-… too; only branches of this repo are pipeline PRs.
	for (const p of prs) if (!p.isCrossRepository) console.log([p.number, p.headRefName, p.headRefOid].join("\t"));
')
