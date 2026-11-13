#!/usr/bin/env bash
# WIP limit for the agent pipeline (issue #77, docs/rules/workflow.md).
#
# An issue is "in progress" from the moment the tester starts until a human
# merges or closes it: open, labelled status:needs-tests (and not `queued`),
# status:needs-dev, status:needs-review or status:needs-human.
#
#   pipeline-wip.sh full [exclude]  exit 0 if WIP_LIMIT issues (other than
#                                   `exclude`) are in progress, 1 otherwise
#   pipeline-wip.sh next            print the oldest queued issue, if any
#
# Needs gh with GH_REPO set (or run inside the repo).
set -euo pipefail

limit=${WIP_LIMIT:-2}

in_progress() {
	local exclude=${1:-}
	{
		gh issue list --state open --label status:needs-tests --limit 100 \
			--json number,labels --jq '.[] | select([.labels[].name] | index("queued") | not) | .number'
		local label
		for label in status:needs-dev status:needs-review status:needs-human; do
			gh issue list --state open --label "$label" --limit 100 --json number --jq '.[].number'
		done
	} | sort -u | grep -vx "${exclude:-none}" || true
}

case "${1:-}" in
	full)
		count=$(in_progress "${2:-}" | grep -c . || true)
		echo "WIP: $count in progress (limit $limit)" >&2
		[ "$count" -ge "$limit" ]
		;;
	next)
		gh issue list --state open --label status:needs-tests --label queued --limit 100 \
			--json number,createdAt --jq 'sort_by(.createdAt) | .[0].number // empty'
		;;
	*)
		echo "usage: $0 full [exclude] | next" >&2
		exit 2
		;;
esac
