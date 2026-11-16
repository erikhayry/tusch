#!/usr/bin/env bash
# Runs every check of the pipeline's scripts (`pnpm run check:agent-fixtures`, a CI
# step). There is no E2E layer for them, so each script has a check that runs it
# against fixtures, a stubbed `gh` or temporary git repositories. All of them run
# even when one fails, so one CI run shows every problem.
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$root" || exit 1
failed=0

run() {
	if ! "$@"; then
		echo "FAIL: $*"
		failed=1
	fi
}

digest() {
	SKILL=develop TARGET=84 CONCLUSION=success RUN_URL=https://github.com/erikhayry/tusch/actions/runs/1001 \
		node scripts/costs.mjs digest scripts/fixtures/execution-sample.json | diff -u scripts/fixtures/digest-sample.json -
}
actions() {
	node scripts/costs.mjs actions scripts/fixtures/digests | diff -u scripts/fixtures/actions-expected.md -
}

run digest
run actions
run bash scripts/check-bounce-fixtures.sh
run bash scripts/check-sync-branches.sh
run bash scripts/check-main-health.sh
run bash scripts/check-wip-script.sh
run bash scripts/check-screenshot-script.sh
run bash scripts/check-container-fixtures.sh

exit $failed
