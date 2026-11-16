#!/usr/bin/env bash
# Runs scripts/check-agent-commits.sh against a temporary git repository: an agent
# may commit app code, a human may commit anything, and an agent commit that
# touches .claude/ or .github/ fails.
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
failed=0

export GIT_CONFIG_GLOBAL=$work/gitconfig GIT_CONFIG_NOSYSTEM=1
git config --global init.defaultBranch main
git init --quiet "$work/repo"
cd "$work/repo" || exit 1

# commit <author> <path>
commit() {
	mkdir -p "$(dirname "$2")"
	echo "$RANDOM" >> "$2"
	git add -A
	git -c user.name="$1" -c user.email=x@example.invalid commit --quiet -m "$1 changes $2"
}

# expect <name> <pass|fail> <range>
expect() {
	local out code
	out=$(bash "$root/scripts/check-agent-commits.sh" "$3" 2>&1)
	code=$?
	if [[ $2 == pass && $code -ne 0 ]] || [[ $2 == fail && $code -eq 0 ]]; then
		echo "FAIL $1: expected $2, got exit $code: $out"
		failed=1
	fi
}

commit human README.md
git tag base
commit 'claude[bot]' src/a.ts
commit human .claude/skills/develop/SKILL.md
commit human .github/workflows/ci.yml
expect agent-app-code-and-human-pipeline pass base..HEAD
git tag ok
commit 'claude[bot]' .claude/skills/develop/SKILL.md
expect agent-skill fail ok..HEAD
git tag skill
commit 'claude[bot]' .github/workflows/agents.yml
expect agent-workflow fail skill..HEAD
expect unreadable-range pass nonsense..HEAD
# A branch cut before the base's agent commits is not blamed for them.
expect base-only-commits pass HEAD...ok

if [[ $failed -eq 0 ]]; then
	echo "agent commits ok"
fi
exit $failed
