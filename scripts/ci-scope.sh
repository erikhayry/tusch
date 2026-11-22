#!/usr/bin/env bash
# Decides how much of CI a change needs.
#
#   ci-scope.sh <git range>     e.g. origin/main...HEAD
#
# Prints `light` when every changed file is documentation, a changelog entry or an
# agent instruction file: nothing the app is built from, so the E2E suite can't be
# affected (a flaky test used to fail changelog-only PRs). Prints `full` for
# everything else, and whenever the range can't be read: when in doubt, test.
set -uo pipefail

range=${1:-}
light='^(docs/|changelog/|\.claude/|[^/]+\.md$)'

files=$(git diff --name-only "$range" 2>/dev/null) || {
	echo full
	exit 0
}
if [[ -z $files ]] || grep -qvE "$light" <<< "$files"; then
	echo full
else
	echo light
fi
