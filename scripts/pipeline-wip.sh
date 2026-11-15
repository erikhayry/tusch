#!/usr/bin/env bash
# WIP limit for the agent pipeline (issue #77, raised to 5 in #183;
# docs/rules/workflow.md).
#
# An issue is "in progress" from the moment the tester starts until a human
# merges or closes it: open, labelled status:needs-tests (and not `queued`),
# status:needs-dev, status:needs-review or status:needs-human.
#
#   pipeline-wip.sh full [exclude]  exit 0 if the limit issues (other than
#                                   `exclude`) are in progress, 1 otherwise
#   pipeline-wip.sh limit           print the effective limit (WIP_LIMIT, default 5)
#   pipeline-wip.sh free            print the free slots (0 when full)
#   pipeline-wip.sh next [n]       print up to n oldest queued issues, one per
#                                   line, oldest first (default 1)
#
# Needs gh with GH_REPO set (or run inside the repo).
set -euo pipefail

limit=${WIP_LIMIT:-5}

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

count_in_progress() {
	in_progress "${1:-}" | grep -c . || true
}

case "${1:-}" in
	full)
		count=$(count_in_progress "${2:-}")
		echo "WIP: $count in progress (limit $limit)" >&2
		[ "$count" -ge "$limit" ]
		;;
	limit)
		echo "$limit"
		;;
	free)
		count=$(count_in_progress)
		echo $((limit > count ? limit - count : 0))
		;;
	next)
		n=${2:-1}
		# $n goes into the jq filter, so only a plain positive integer is allowed.
		[[ $n =~ ^[1-9][0-9]*$ ]] || {
			echo "next: count must be a positive integer, got '$n'" >&2
			exit 2
		}
		gh issue list --state open --label status:needs-tests --label queued --limit 100 \
			--json number,createdAt --jq "sort_by(.createdAt) | .[0:$n][] | .number"
		;;
	*)
		echo "usage: $0 full [exclude] | limit | free | next [n]" >&2
		exit 2
		;;
esac
