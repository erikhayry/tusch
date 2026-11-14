#!/usr/bin/env bash
# Shared by sonar-bounce.sh (#80) and conflict-bounce.sh (#168): the guard, the
# round count, the comment and the hand-off. Sourced, so it runs nothing itself.
#
# DRY_RUN=1 prints each change instead of making it, and prints the comment body
# with `| ` prefixes; check-conflict-fixtures.sh relies on that output.
#
# A label change made with GITHUB_TOKEN starts no runs, so the hand-off ends with
# a dispatch of agents.yml.

# Mutating gh calls go through here so DRY_RUN can print them.
bounce_gh() {
	if [[ -n ${DRY_RUN:-} ]]; then
		echo "DRY_RUN: gh $*"
	else
		gh "$@"
	fi
}

# JSON is read with node, not jq: node is on every runner and dev machine of this
# repo, and jq is not.

# Prints the label names of the issue JSON on stdin, one per line.
bounce_label_names() {
	node -e 'const d = JSON.parse(require("fs").readFileSync(0, "utf8")); for (const l of d.labels) console.log(l.name);'
}

# Succeeds when the issue waits for the human. $1 is the issue number, $2 the JSON
# of `gh issue view --json labels,comments`. Otherwise logs why and fails.
bounce_is_waiting() {
	local issue=$1 json=$2 names status
	names=$(printf '%s' "$json" | bounce_label_names)
	if printf '%s\n' "$names" | grep -qx status:needs-human; then
		return 0
	fi
	status=$(printf '%s\n' "$names" | grep '^status:' | paste -sd ' ' - || true)
	echo "Issue #$issue is not status:needs-human (now: ${status:-no status label}); left alone."
	return 1
}

# Prints how many comments of the issue JSON $2 start with the round marker $1.
bounce_rounds() {
	printf '%s' "$2" | node -e '
		const marker = process.argv[1];
		const d = JSON.parse(require("fs").readFileSync(0, "utf8"));
		console.log(d.comments.filter((c) => c.body.startsWith(marker)).length);
	' "$1"
}

# Posts the comment in file $2 on issue $1.
bounce_comment() {
	bounce_gh issue comment "$1" --body-file "$2"
	if [[ -n ${DRY_RUN:-} ]]; then
		sed 's/^/| /' "$2"
	fi
}

# Hands the issue on after a bounce: to /develop, or to status:blocked once the
# issue has been bounced max_rounds times. $1 issue, $2 rounds so far, $3 max.
bounce_hand_off() {
	local issue=$1 rounds=$2 max_rounds=$3
	if [[ "$rounds" -ge "$max_rounds" ]]; then
		bounce_gh issue edit "$issue" --remove-label status:needs-human --add-label status:blocked
	else
		bounce_gh issue edit "$issue" --remove-label status:needs-human --add-label status:needs-dev
		bounce_gh workflow run agents.yml --ref "${BRANCH:-main}" -f issue="$issue"
	fi
}
