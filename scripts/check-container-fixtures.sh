#!/usr/bin/env bash
# Runs scripts/check-container-tags.sh [root] against generated fixture trees and
# the real repo (issue #243). The check compares the `container:` tags in ci.yml
# and agents.yml with the locked @playwright/test version in pnpm-lock.yaml.
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
script=$root/scripts/check-container-tags.sh
failed=0

fail() {
	echo "FAIL $1: $2"
	failed=1
}

if [[ ! -f $script ]]; then
	echo "FAIL: $script does not exist"
	exit 1
fi

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# make_tree <dir> <ci version> <agents version> <locked version>
make_tree() {
	mkdir -p "$1/.github/workflows"
	printf 'jobs:\n  test:\n    runs-on: ubuntu-latest\n    container: mcr.microsoft.com/playwright:v%s-noble\n' "$2" > "$1/.github/workflows/ci.yml"
	printf 'jobs:\n  agent:\n    runs-on: ubuntu-latest\n    container: mcr.microsoft.com/playwright:v%s-noble\n' "$3" > "$1/.github/workflows/agents.yml"
	printf "packages:\n\n  '@playwright/test@%s':\n    resolution: {}\n" "$4" > "$1/pnpm-lock.yaml"
}

# expect <name> <pass|fail> <ci> <agents> <lock> [strings the output must contain…]
expect() {
	name=$1
	want=$2
	make_tree "$work/$name" "$3" "$4" "$5"
	shift 5
	out=$(bash "$script" "$work/$name" 2>&1)
	code=$?
	if [[ $want == pass && $code -ne 0 ]]; then fail "$name" "expected success, got exit $code: $out"; fi
	if [[ $want == fail && $code -eq 0 ]]; then fail "$name" "expected a non-zero exit"; fi
	for s in "$@"; do
		grep -qF -- "$s" <<< "$out" || fail "$name" "output lacks '$s': $out"
	done
}

expect ok-matching pass 1.63.0 1.63.0 1.63.0
expect fail-workflows-differ fail 1.63.0 1.62.0 1.63.0 agents.yml v1.62.0 1.63.0
expect fail-lockfile-differs fail 1.63.0 1.63.0 1.64.0 ci.yml agents.yml v1.63.0 1.64.0

# The real repo must be consistent too
bash "$script" "$root" > "$work/real.txt" 2>&1 || fail real-repo "$(cat "$work/real.txt")"

if [[ $failed -eq 0 ]]; then
	echo "container fixtures ok"
fi
exit $failed
