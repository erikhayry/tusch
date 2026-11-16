#!/usr/bin/env bash
# Dry-runs scripts/main-health.sh for each outcome of a CI run on main. There is
# no E2E layer for pipeline scripts, so each acceptance criterion is a case here.
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
failed=0

# expect <name> <conclusion> <attempt> <open issue> <line the output must contain>… ['!' <line it must not contain>]
expect() {
	local name=$1 out want
	out=$(env -u BRANCH DRY_RUN=1 CONCLUSION="$2" RUN_ATTEMPT="$3" MAIN_OPEN_ISSUE="$4" RUN_ID=900 \
		RUN_URL=https://github.com/o/r/actions/runs/900 HEAD_SHA=abc1 bash "$root/scripts/main-health.sh" 2>&1) || {
		echo "FAIL $name: exit $?: $out"
		failed=1
		return
	}
	shift 4
	for want in "$@"; do
		if [[ ${want:0:1} == '!' ]]; then
			if grep -qF -- "${want:1}" <<< "$out"; then
				echo "FAIL $name: unexpected '${want:1}' in: $out"
				failed=1
			fi
		elif ! grep -qF -- "$want" <<< "$out"; then
			echo "FAIL $name: no '$want' in: $out"
			failed=1
		fi
	done
}

expect green success 1 '' 'nothing to do' '!DRY_RUN'
expect first-failure failure 1 '' 'DRY_RUN: gh run rerun 900 --failed' '!issue create'
expect second-failure failure 2 '' 'DRY_RUN: gh issue create --title CI fails on main --label type:bug --label main-broken --label status:idea' '!rerun'
expect still-broken failure 2 41 'DRY_RUN: gh issue comment 41' '!issue create'
expect recovered success 2 41 'DRY_RUN: gh issue comment 41' 'DRY_RUN: gh issue close 41'
expect cancelled cancelled 1 41 'nothing to do' '!DRY_RUN'

if [[ $failed -eq 0 ]]; then
	echo "main health ok"
fi
exit $failed
