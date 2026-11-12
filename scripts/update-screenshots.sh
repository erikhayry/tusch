#!/usr/bin/env bash
# Regenerate screenshot baselines on Linux (CI container) for the current branch
# and download them into the working tree. The branch must be pushed first.
set -euo pipefail
cd "$(dirname "$0")/.."

branch=$(git branch --show-current)
if [ -n "$(git log "origin/$branch..HEAD" 2>/dev/null)" ] || ! git rev-parse --verify -q "origin/$branch" >/dev/null; then
	echo "Push '$branch' first; CI renders the committed code." >&2
	exit 1
fi

echo "Starting CI screenshot update for $branch…"
gh workflow run ci.yml --ref "$branch" -f update_screenshots=true
sleep 5
run=$(gh run list --workflow ci.yml --branch "$branch" --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId')
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
