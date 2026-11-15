#!/usr/bin/env bash
# Runs scripts/update-screenshots.sh with pnpm, gh and git replaced by shims that
# log every call (issue #243). There is no E2E layer for pipeline scripts, so each
# acceptance criterion is one case here. No real Playwright run, no real gh call.
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
script=$root/scripts/update-screenshots.sh
failed=0

fail() {
	echo "FAIL $1: $2"
	failed=1
}

shims=$(mktemp -d)
trap 'rm -rf "$shims"' EXIT
cat > "$shims/pnpm" <<'SHIM'
#!/usr/bin/env bash
echo "pnpm $*" >> "$CALLS"
if [[ ${SHIM_PLAYWRIGHT_FAILS:-} == 1 && $* == *"playwright test"* ]]; then exit 1; fi
SHIM
cat > "$shims/gh" <<'SHIM'
#!/usr/bin/env bash
echo "gh $*" >> "$CALLS"
if [[ $1 == workflow ]]; then echo "https://github.com/o/r/actions/runs/777"; fi
if [[ $1 == run && $2 == download ]]; then
	while [[ $# -gt 0 ]]; do
		if [[ $1 == --dir ]]; then mkdir -p "$2"; fi
		shift
	done
fi
SHIM
cat > "$shims/git" <<'SHIM'
#!/usr/bin/env bash
echo "git $*" >> "$CALLS"
case $1 in
branch) echo "issue-1-demo" ;;
status) echo " M src/routes/__screenshots__/x.png" ;;
esac
exit 0
SHIM
chmod +x "$shims"/*

# run_case <name> [VAR=value…]; leaves the calls in $calls and the output in $out
run_case() {
	name=$1
	shift
	calls=$(mktemp)
	out=$(mktemp)
	env -u GITHUB_ACTIONS -u PLAYWRIGHT_SCREENSHOTS CALLS="$calls" PATH="$shims:$PATH" "$@" \
		bash "$script" > "$out" 2>&1
	code=$?
}

expect_call() {
	grep -qxF -- "$2" "$calls" || fail "$1" "missing call: $2"
}
expect_no_call() {
	if grep -qE -- "$2" "$calls"; then fail "$1" "unexpected call matching: $2"; fi
}

# In place: both variables set
run_case in-place GITHUB_ACTIONS=true PLAYWRIGHT_SCREENSHOTS=1
[[ $code -eq 0 ]] || fail in-place "exit $code: $(cat "$out")"
expect_call in-place "pnpm exec svelte-kit sync"
expect_call in-place "pnpm exec playwright test screenshots --update-snapshots=all"
sync_line=$(grep -n 'svelte-kit sync' "$calls" | cut -d: -f1)
test_line=$(grep -n 'playwright test' "$calls" | cut -d: -f1)
if [[ -n $sync_line && -n $test_line && $sync_line -gt $test_line ]]; then
	fail in-place "svelte-kit sync must run before playwright"
fi
expect_no_call in-place '^gh '
expect_no_call in-place '^git (log|rev-parse)'
grep -qE '^git status --short' "$calls" || fail in-place "missing git status --short"
grep -qF "__screenshots__" "$calls" || fail in-place "git status must be limited to __screenshots__ files"
grep -qF "Review the images, then commit them." "$out" || fail in-place "missing review line"

# In place, Playwright fails
run_case in-place-failing GITHUB_ACTIONS=true PLAYWRIGHT_SCREENSHOTS=1 SHIM_PLAYWRIGHT_FAILS=1
[[ $code -ne 0 ]] || fail in-place-failing "exited 0 after a failed Playwright run"
grep -qF "screenshot run failed" "$out" || fail in-place-failing "message lacks 'screenshot run failed'"
if grep -qF "Review the images" "$out"; then fail in-place-failing "printed the success line"; fi

# Dispatch mode: either variable (or both) missing
dispatch_case() {
	name=dispatch-$1
	shift
	run_case "$name" "$@"
	[[ $code -eq 0 ]] || fail "$name" "exit $code: $(cat "$out")"
	expect_call "$name" "gh workflow run ci.yml --ref issue-1-demo -f update_screenshots=true"
	expect_call "$name" "gh run watch 777 --exit-status"
	grep -qE '^gh run download 777 --name screenshots --dir ' "$calls" || fail "$name" "missing gh run download"
	expect_no_call "$name" '^pnpm '
}
dispatch_case none
dispatch_case only-actions GITHUB_ACTIONS=true
dispatch_case only-screenshots PLAYWRIGHT_SCREENSHOTS=1

if [[ $failed -eq 0 ]]; then
	echo "screenshot script ok"
fi
exit $failed
