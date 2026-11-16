#!/usr/bin/env bash
# Keeps waiting pipeline PRs merged with main, so what the human merges was tested
# against the main it lands on, and so conflicts that need no judgement never stop
# the flow. No AI.
#
#   sync-branches.sh <clone>
#
# <clone> is a full clone of the repo that may push (not the checkout this script
# runs from: it switches branches). Run by pipeline.yml's `prs` job when main moves
# and on the schedule. For every open PR on a branch issue-<n>-… whose issue waits
# for the human (status:needs-human) and is behind main, it merges main with
# scripts/merge-main.sh and pushes. Then:
#
#   merged cleanly             CI is dispatched for the branch (a push made with
#                              GITHUB_TOKEN starts no run)
#   baselines taken from main  the branch is listed in the `screenshots` output;
#                              pipeline.yml regenerates them and dispatches CI
#   conflicts left             nothing is pushed; conflict-bounce.sh sends the
#                              issue to /develop
#   push rejected              one comment per main commit (the token may not push
#                              workflow file changes); a human merges main
#
# Outputs (to $GITHUB_OUTPUT when set, else stdout): `handled`, the PR numbers it
# pushed to, and `screenshots`, a JSON array of {branch, pr} to regenerate.
# Needs gh (GH_TOKEN, GH_REPO), node and git. DRY_RUN=1 prints gh changes and
# pushes instead of making them.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$root/bounce-lib.sh"

clone=${1:?usage: sync-branches.sh <clone>}
base=${BRANCH:-main}
handled=()
screenshots=()
# Outside the clone, so a comment body never ends up in a merge.
comment=$(mktemp -d)/sync-comment.md

cd "$clone"
git fetch --quiet origin "+refs/heads/$base:refs/remotes/origin/$base"
base_sha=$(git rev-parse "origin/$base")

push_branch() {
	if [[ -n ${DRY_RUN:-} ]]; then
		echo "DRY_RUN: git push origin HEAD:refs/heads/$1"
	else
		git push --quiet origin "HEAD:refs/heads/$1"
	fi
}

# The push is refused when the merge brings in a workflow change (GITHUB_TOKEN has
# no `workflows` permission) or when the branch moved meanwhile. Say so once per
# main commit; the marker keeps the schedule from repeating it.
report_rejected() {
	local issue=$1 pr=$2 branch=$3 json=$4 marker="<!-- sync-rejected:$base_sha -->"
	if printf '%s' "$json" | grep -qF -- "$marker"; then
		return
	fi
	{
		echo "### Pipeline: could not merge \`$base\` into PR #$pr"
		echo
		echo "The merge was clean, but the push to \`$branch\` was rejected. The usual cause is a workflow file that changed on \`$base\`: the pipeline's token may not push those. A human needs to run:"
		echo
		echo '```sh'
		echo "git fetch origin && git switch $branch && git pull && git merge origin/$base && git push"
		echo '```'
		echo
		echo "$marker"
	} > "$comment"
	bounce_comment "$issue" "$comment"
}

while IFS=$'\t' read -r pr branch; do
	if [[ ! $branch =~ ^issue-([0-9]+)- ]]; then
		echo "PR #$pr is on $branch, not an issue-<n> branch; left alone."
		continue
	fi
	issue=${BASH_REMATCH[1]}

	json=$(gh issue view "$issue" --json labels,comments) || {
		echo "Could not read issue #$issue for PR #$pr; skipped."
		continue
	}
	bounce_is_waiting "$issue" "$json" || continue

	git fetch --quiet origin "+refs/heads/$branch:refs/remotes/origin/$branch"
	if git merge-base --is-ancestor "origin/$base" "origin/$branch"; then
		echo "PR #$pr already contains $base; nothing to do."
		continue
	fi

	git checkout --quiet --force -B "$branch" "origin/$branch"
	status=0
	out=$("$root/merge-main.sh" "origin/$base") || status=$?
	if [[ $status -eq 3 ]]; then
		echo "PR #$pr has conflicts the pipeline can't resolve; left to conflict-bounce.sh:"
		printf '%s\n' "$out" | sed -n 's/^conflict:/  /p'
		continue
	fi
	if [[ $status -ne 0 ]]; then
		echo "merge-main.sh failed for PR #$pr (exit $status); skipped."
		continue
	fi

	if ! push_branch "$branch"; then
		echo "Push to $branch was rejected."
		report_rejected "$issue" "$pr" "$branch" "$json"
		continue
	fi
	handled+=("$pr")

	baselines=$(printf '%s\n' "$out" | sed -n 's/^screenshot://p')
	if [[ -z $baselines ]]; then
		echo "PR #$pr: merged $base into $branch."
		bounce_gh workflow run ci.yml --ref "$branch"
		continue
	fi
	echo "PR #$pr: merged $base into $branch; baselines to regenerate."
	screenshots+=("{\"branch\":\"$branch\",\"pr\":$pr}")
	{
		echo "### Pipeline: merged \`$base\`, regenerating screenshot baselines"
		echo
		echo "This branch and \`$base\` both changed these baselines, so they are rendered again from the merged code:"
		echo
		printf '%s\n' "$baselines" | sed 's/^/- `/; s/$/`/'
		echo
		echo "Look at the new images in this PR's diff before merging."
	} > "$comment"
	bounce_gh pr comment "$pr" --body-file "$comment"
done < <(gh pr list --state open --base "$base" --limit 500 --json number,headRefName,isCrossRepository |
	node -e '
		const prs = JSON.parse(require("fs").readFileSync(0, "utf8"));
		for (const p of prs) if (!p.isCrossRepository) console.log([p.number, p.headRefName].join("\t"));
	')

list=$(
	IFS=,
	echo "[${screenshots[*]:-}]"
)
{
	echo "handled=${handled[*]:-}"
	echo "screenshots=$list"
} >> "${GITHUB_OUTPUT:-/dev/stdout}"
