#!/usr/bin/env bash
# Regenerate screenshot baselines on Linux (CI container) for the current branch
# and download them into the working tree. The branch must be pushed first.
#
# Inside the CI container (agent runs on GitHub) the baselines are rendered in
# place instead: the agent token can't dispatch workflows, and the container is
# the same image as ci.yml's (scripts/check-container-tags.sh keeps them equal).
# Both variables are required: GITHUB_ACTIONS alone is set by CI jobs that don't
# run in that container.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${GITHUB_ACTIONS:-}" = true ] && [ "${PLAYWRIGHT_SCREENSHOTS:-}" = 1 ]; then
	pnpm exec svelte-kit sync
	if ! pnpm exec playwright test screenshots --update-snapshots=all; then
		echo "The screenshot run failed; the Playwright output above says which views differ." >&2
		exit 1
	fi
	git status --short -- 'src/**/__screenshots__/*'
	echo "Review the images, then commit them."
	exit 0
fi

branch=$(git branch --show-current)
if [ -n "$(git log "origin/$branch..HEAD" 2>/dev/null)" ] || ! git rev-parse --verify -q "origin/$branch" >/dev/null; then
	echo "Push '$branch' first; CI renders the committed code." >&2
	exit 1
fi

echo "Starting CI screenshot update for ${branch}…"
# gh prints the new run's URL; take its id so we never pick up an older run.
url=$(gh workflow run ci.yml --ref "$branch" -f update_screenshots=true 2>&1 | grep -Eo 'https://[^ ]+/actions/runs/[0-9]+' | tail -1)
run=${url##*/}
if [ -z "$run" ]; then
	echo "Couldn't read the run id from 'gh workflow run'; update the GitHub CLI so it prints the run URL, then retry." >&2
	exit 1
fi
echo "$url"
gh run watch "$run" --exit-status >/dev/null || {
	echo "Run $run failed: gh run view $run --log-failed" >&2
	exit 1
}

tmp=$(mktemp -d)
gh run download "$run" --name screenshots --dir "$tmp"
cp -R "$tmp"/. src/
rm -rf "$tmp"
git status --short -- 'src/**/__screenshots__/*'
echo "Review the images, then commit them."
