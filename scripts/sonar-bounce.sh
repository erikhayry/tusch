#!/usr/bin/env bash
# Sends a pipeline PR back to the developer when SonarCloud fails (issue #80).
#
#   sonar-bounce.sh <issue> <pr>
#
# Run by agents.yml's `sonar` job when the "SonarCloud Code Analysis" check
# fails on a branch issue-<n>-…. Only acts while the issue waits for the human
# (status:needs-human): earlier stages are still changing the code. Comments
# the open Sonar issues and hotspots on the issue, moves it to status:needs-dev
# and starts /develop (a dispatch, since label changes made with GITHUB_TOKEN
# start no runs). After MAX_ROUNDS bounces it blocks instead, to avoid a loop.
#
# Needs gh (GH_TOKEN, GH_REPO), curl, jq, and SONAR_PROJECT (e.g. owner_repo).
set -euo pipefail

issue=$1
pr=$2
max_rounds=${MAX_ROUNDS:-2}
marker='### Pipeline: SonarCloud failed'
api='https://sonarcloud.io/api'

labels=$(gh issue view "$issue" --json labels --jq '.labels[].name')
if ! printf '%s\n' "$labels" | grep -qx status:needs-human; then
	echo "Issue #$issue is not status:needs-human; the pipeline is still working on it."
	exit 0
fi

rounds=$(gh issue view "$issue" --json comments --jq "[.comments[] | select(.body | startswith(\"$marker\"))] | length")

sonar() {
	curl --proto '=https' --tlsv1.2 -fsS "$api/$1" || echo '{}'
}

{
	echo "$marker (round $((rounds + 1)) of $max_rounds)"
	echo
	echo "The SonarCloud quality gate failed on PR #$pr: https://sonarcloud.io/summary/new_code?id=$SONAR_PROJECT&pullRequest=$pr"
	echo
	echo '**Failed gate conditions**'
	echo
	sonar "qualitygates/project_status?projectKey=$SONAR_PROJECT&pullRequest=$pr" |
		jq -r '(.projectStatus.conditions // [])[] | select(.status != "OK") |
			"- `\(.metricKey)`: \(.actualValue) (limit \(.comparator) \(.errorThreshold))"'
	# A condition like duplication or coverage has no issues; name the files behind it.
	sonar "measures/component_tree?component=$SONAR_PROJECT&pullRequest=$pr&metricKeys=new_duplicated_lines&qualifiers=FIL&ps=100" |
		jq -r '(.components // [])[] | {path, v: ([.measures[]? | (.period.value // .periods[0].value // "0") | tonumber] | add // 0)} |
			select(.v > 0) | "  - duplicated new lines in `\(.path)`: \(.v)"'
	echo
	echo 'Duplication in fixtures or generated data is better excluded (`sonar.cpd.exclusions` in `.sonarcloud.properties`) than refactored.'
	echo
	echo '**Issues**'
	echo
	sonar "issues/search?componentKeys=$SONAR_PROJECT&pullRequest=$pr&resolved=false&ps=100" |
		jq -r '(.issues // [])[] | "- `\(.component | sub("^[^:]*:"; ""))`:\(.line // "-") \(.severity // .impacts[0].severity // "") \(.rule): \(.message)"'
	echo
	echo '**Security hotspots**'
	echo
	sonar "hotspots/search?projectKey=$SONAR_PROJECT&pullRequest=$pr&status=TO_REVIEW&ps=100" |
		jq -r '(.hotspots // [])[] | "- `\(.component | sub("^[^:]*:"; ""))`:\(.line // "-") \(.ruleKey): \(.message)"'
	echo
	if [[ "$rounds" -ge "$max_rounds" ]]; then
		echo "This failed $rounds times already, so the issue is **blocked**: a human needs to look at the findings (fix, or mark them in SonarCloud)."
	else
		echo 'Developer: fix each finding on the branch (or explain in your comment why it is a false positive), then hand off to review as usual. The reviewer updates the existing PR.'
	fi
} > sonar-comment.md

gh issue comment "$issue" --body-file sonar-comment.md
if [[ "$rounds" -ge "$max_rounds" ]]; then
	gh issue edit "$issue" --remove-label status:needs-human --add-label status:blocked
else
	gh issue edit "$issue" --remove-label status:needs-human --add-label status:needs-dev
	gh workflow run agents.yml --ref "${BRANCH:-main}" -f issue="$issue"
fi
