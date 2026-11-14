#!/usr/bin/env bash
# Sends pipeline PRs back to the developer when they conflict with main (#168).
#
#   conflict-bounce.sh
#
# Run by agents.yml's `conflict` job, on a merged pull request and on the
# 30-minute schedule, so it scans every open PR, not only the one that merged. A
# PR counts when its branch is issue-<n>-… and GitHub reports it CONFLICTING, and
# its issue waits for the human (status:needs-human). The script comments the
# conflicting files on the issue, moves it to status:needs-dev and dispatches
# /develop, which merges origin/main into the branch. After MAX_ROUNDS bounces it
# blocks the issue instead. No AI: it only reads state and writes a comment.
#
# Needs gh (GH_TOKEN, GH_REPO), node (JSON) and git 2.38+ (merge-tree --write-tree). With
# CONFLICT_FIXTURES=<case dir> the PR list, issue state and conflicting files are
# read from that directory instead; with DRY_RUN=1 changes are printed, not made.
# The contract is in check-conflict-fixtures.sh.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$root/bounce-lib.sh"

max_rounds=${MAX_ROUNDS:-2}
marker='### Pipeline: merge conflict with main'
fixtures=${CONFLICT_FIXTURES:-}

open_prs() {
	if [[ -n $fixtures ]]; then
		cat "$fixtures/prs.json"
	else
		# gh lists 30 PRs by default; a busy repo needs more to scan them all.
		gh pr list --state open --limit 500 --json number,headRefName,mergeable
	fi
}

issue_json() {
	if [[ -n $fixtures ]]; then
		cat "$fixtures/issues/$1.json"
	else
		gh issue view "$1" --json labels,comments
	fi
}

# Prints the conflicting paths, one per line. merge-tree --write-tree prints the
# tree id, then the paths, then a blank line; it exits 1 on conflicts, so only
# exit codes above 1 are errors.
conflicting_files() {
	if [[ -n $fixtures ]]; then
		cat "$fixtures/files/$1.txt"
		return
	fi
	local branch=$2 out status=0
	git fetch --quiet origin "+refs/heads/main:refs/remotes/origin/main" "+refs/heads/$branch:refs/remotes/origin/$branch"
	out=$(git merge-tree --write-tree --name-only --no-messages origin/main "origin/$branch") || status=$?
	if [[ $status -gt 1 ]]; then
		echo "git merge-tree failed for $branch (exit $status)" >&2
		exit 1
	fi
	printf '%s\n' "$out" | tail -n +2 | sed '/^$/,$d'
}

while IFS=$'\t' read -r pr branch mergeable; do
	if [[ ! $branch =~ ^issue-([0-9]+)- ]]; then
		echo "PR #$pr is on $branch, not an issue-<n> branch; left alone."
		continue
	fi
	issue=${BASH_REMATCH[1]}

	if [[ $mergeable == UNKNOWN ]]; then
		echo "PR #$pr mergeable is UNKNOWN (GitHub is still computing it); the next scheduled run checks again."
		continue
	fi
	if [[ $mergeable != CONFLICTING ]]; then
		echo "PR #$pr is $mergeable; nothing to do."
		continue
	fi

	json=$(issue_json "$issue") || {
		echo "Could not read issue #$issue for PR #$pr; skipped."
		continue
	}
	bounce_is_waiting "$issue" "$json" || continue

	files=$(conflicting_files "$pr" "$branch") || {
		echo "Could not list the conflicting files of PR #$pr; skipped."
		continue
	}
	rounds=$(bounce_rounds "$marker" "$json")
	{
		echo "$marker (round $((rounds + 1)) of $max_rounds)"
		echo
		echo "PR #$pr on \`$branch\` conflicts with \`main\`. Conflicting files:"
		echo
		printf '%s\n' "$files" | sed 's/^/- `/; s/$/`/'
		echo
		if [[ "$rounds" -ge "$max_rounds" ]]; then
			echo 'This conflicted '"$rounds"' times already, so the issue is **blocked**: a human must resolve the conflict with `main` (or close the PR).'
		else
			echo 'Developer: merge `origin/main` into the branch (`git fetch origin`, then `git merge origin/main`), resolve each conflict, commit the merge, run the usual checks, push, and hand off to review as usual. Never rebase or force-push. Screenshot baselines and requirement ids have special rules; see `/develop`.'
		fi
	} > conflict-comment.md

	bounce_comment "$issue" conflict-comment.md
	bounce_hand_off "$issue" "$rounds" "$max_rounds"
done < <(open_prs | node -e '
	const prs = JSON.parse(require("fs").readFileSync(0, "utf8"));
	for (const p of prs) console.log([p.number, p.headRefName, p.mergeable].join("\t"));
')
