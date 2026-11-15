#!/usr/bin/env bash
# Checks scripts/pipeline-wip.sh against a stubbed `gh` (issue #183). There is
# no E2E layer for pipeline scripts, so each script acceptance criterion is a
# case below. The stub (scripts/fixtures/wip/gh) serves the issues a case
# declares; `release` and `queue` in agents.yml are covered by the
# human-applied workflow diff, not here.
#
# Run: bash scripts/check-wip-script.sh
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
script=$root/scripts/pipeline-wip.sh
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
failed=0

# `gh` on PATH, so the script never reaches the real GitHub.
mkdir "$work/bin"
printf '#!/usr/bin/env bash\nexec node "%s" "$@"\n' "$root/scripts/fixtures/wip/gh" > "$work/bin/gh"
chmod +x "$work/bin/gh"

# issues "<number>|<label[,label]>|<createdAt>" ... writes the stub's data.
issues() {
	local json='' spec number labels created
	for spec in "$@"; do
		IFS='|' read -r number labels created <<< "$spec"
		labels=${labels//,/\",\"}
		json+="{\"number\":$number,\"createdAt\":\"${created:-2026-01-01T00:00:00Z}\",\"labels\":[\"$labels\"]},"
	done
	echo "[${json%,}]" > "$work/issues.json"
}

# run <args...> sets $out, $err and $code; WIP_LIMIT only if $limit_env is set.
run() {
	local env=(PATH="$work/bin:$PATH" STUB_ISSUES="$work/issues.json")
	[[ -n ${limit_env:-} ]] && env+=(WIP_LIMIT="$limit_env")
	env -u WIP_LIMIT "${env[@]}" bash "$script" "$@" > "$work/out" 2> "$work/err"
	code=$?
	out=$(<"$work/out")
	err=$(<"$work/err")
}

fail() {
	echo "FAIL $1: $2"
	failed=1
}

# expect <name> <exit code> <stdout> [stderr substring]
expect() {
	local name=$1 want_code=$2 want_out=$3 want_err=${4:-}
	[[ $code -eq $want_code ]] || fail "$name" "exit $code, want $want_code"
	[[ $out == "$want_out" ]] || fail "$name" "stdout '$out', want '$want_out'"
	[[ -z $want_err || $err == *"$want_err"* ]] || fail "$name" "stderr '$err' lacks '$want_err'"
}

in_progress() { # in_progress <count>: that many issues, spread over the counted labels
	local labels=(status:needs-tests status:needs-dev status:needs-review status:needs-human)
	local specs=() i
	for ((i = 1; i <= $1; i++)); do
		specs+=("$i|${labels[i % 4]}")
	done
	issues "${specs[@]}"
}

# --- full ---
limit_env=''
in_progress 4
run full
expect 'full with 4 in progress is not full' 1 '' 'WIP: 4 in progress (limit 5)'

in_progress 5
run full
expect 'full with 5 in progress is full' 0 '' 'WIP: 5 in progress (limit 5)'

limit_env=2
in_progress 2
run full
expect 'WIP_LIMIT=2 with 2 in progress is full' 0 '' '(limit 2)'
limit_env=''

# One issue per counted label, plus a queued one that must not count.
issues '1|status:needs-tests' '2|status:needs-dev' '3|status:needs-review' '4|status:needs-human' \
	'5|status:needs-tests,queued'
run full
expect 'queued issues do not count' 1 '' 'WIP: 4 in progress'

issues '1|status:needs-tests' '2|status:needs-dev' '3|status:needs-review' '4|status:needs-human' \
	'5|status:needs-human'
run full
expect 'needs-human counts towards the limit' 0 '' 'WIP: 5 in progress'

in_progress 5
run full 5
expect 'full <n> excludes issue n' 1 '' 'WIP: 4 in progress'

# --- limit ---
run limit
expect 'limit prints the default' 0 5

limit_env=3
run limit
expect 'limit prints WIP_LIMIT when set' 0 3
limit_env=''

# --- free ---
in_progress 3
run free
expect 'free with 3 in progress' 0 2

in_progress 5
run free
expect 'free with 5 in progress' 0 0

in_progress 7
run free
expect 'free with 7 in progress never goes negative' 0 0

# --- next ---
issues '11|status:needs-tests,queued|2026-01-03T00:00:00Z' '12|status:needs-tests,queued|2026-01-01T00:00:00Z'
run next 3
expect 'next 3 prints both queued issues, oldest first' 0 $'12\n11'

run next
expect 'next without a count prints only the oldest' 0 12

issues '21|status:needs-tests,queued|2026-01-03T00:00:00Z' '22|status:needs-tests,queued|2026-01-01T00:00:00Z' \
	'23|status:needs-tests,queued|2026-01-02T00:00:00Z' '24|status:needs-dev'
run next 2
expect 'next 2 prints the two oldest queued issues' 0 $'22\n23'

issues '31|status:needs-dev'
run next 2
expect 'next with nothing queued prints nothing' 0 ''

if [[ $failed -eq 0 ]]; then
	echo "wip script ok"
fi
exit $failed
