#!/usr/bin/env bash
# Fails when a commit made by an agent changes the files that define what agents
# may do: workflows, skills, subagents and settings (docs/rules/agents.md,
# "Workflow and agent files"). A human applies those changes.
#
#   check-agent-commits.sh <git range>     e.g. origin/main...HEAD
#
# /test, /develop and /reviewer have a plain shell, so the tools no longer stop
# such an edit; this CI step does. It goes by the commit author (agents commit as
# claude[bot]), which catches a mistake, not an agent that sets out to hide one:
# the human reviewing the PR's diff is still the real gate.
set -uo pipefail

range=${1:?usage: check-agent-commits.sh <git range>}
# `git log a...b` also lists what only the base has; only the branch's own commits count.
range=${range/.../..}
agent='claude[bot]'

commits=$(git log --no-merges --format='%h %an%x09%s' "$range" -- .github .claude 2> /dev/null) || {
	echo "Could not read $range; nothing checked." >&2
	exit 0
}
found=$(grep -F " $agent	" <<< "$commits" || true)
if [[ -n $found ]]; then
	echo "Agent commits must not change .github/ or .claude/ (a human applies those changes):" >&2
	echo "$found" >&2
	exit 1
fi
echo "No agent commit changes .github/ or .claude/."
