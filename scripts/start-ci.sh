#!/usr/bin/env bash
# Starts CI for a branch the pipeline just pushed to.
#
#   start-ci.sh <branch> [sha]
#
# A push made with GITHUB_TOKEN starts no CI run of its own, but GitHub still creates
# the PR's `pull_request` run and holds it as `action_required`. A dispatched run
# passes and yet never gives the PR its `test` check, so the PR stays blocked. So
# approve the held run for the pushed commit; only when none shows up, dispatch CI.
#
# [sha] defaults to the branch's head. Needs gh (GH_TOKEN, GH_REPO) with
# `actions: write`. CI_POLL_TRIES and CI_POLL_SLEEP set how long to wait for the
# held run to appear (default 10 x 3 s); DRY_RUN=1 prints the changes instead.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$root/bounce-lib.sh"

branch=${1:?usage: start-ci.sh <branch> [sha]}
sha=${2:-$(gh api "repos/${GH_REPO:?GH_REPO is not set}/commits/$branch" --jq .sha)}

for ((try = 1; try <= ${CI_POLL_TRIES:-10}; try++)); do
	run=$(gh run list --workflow ci.yml --branch "$branch" --event pull_request --limit 20 \
		--json databaseId,headSha,conclusion \
		--jq ".[] | select(.headSha == \"$sha\" and .conclusion == \"action_required\") | .databaseId" |
		head -n 1)
	if [[ -n $run ]]; then
		if bounce_gh api -X POST "repos/${GH_REPO:-}/actions/runs/$run/approve" > /dev/null; then
			echo "Approved CI run $run for $branch."
			exit 0
		fi
		echo "Could not approve CI run $run for $branch; dispatching CI instead."
		break
	fi
	sleep "${CI_POLL_SLEEP:-3}"
done

bounce_gh workflow run ci.yml --ref "$branch"
echo "Dispatched CI for $branch."
