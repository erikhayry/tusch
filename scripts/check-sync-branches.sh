#!/usr/bin/env bash
# Runs scripts/merge-main.sh and scripts/sync-branches.sh against real git
# repositories built in a temporary directory, with `gh` replaced by a shim that
# serves the PRs and issues of a case and logs every call. There is no E2E layer
# for pipeline scripts, so each acceptance criterion is one case here.
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
failed=0

fail() {
	echo "FAIL $1: $2"
	failed=1
}

export GIT_CONFIG_GLOBAL=$work/gitconfig GIT_CONFIG_NOSYSTEM=1
git config --global user.name pipeline
git config --global user.email pipeline@example.invalid
git config --global init.defaultBranch main
git config --global advice.detachedHead false

# A bare origin whose main holds one file of each kind the merge treats specially.
origin=$work/origin.git
seed=$work/seed
git init --quiet --bare "$origin"
git init --quiet "$seed"
(
	cd "$seed" || exit 1
	mkdir -p messages docs src
	printf '{\n\t"hello": "Hello",\n\t"bye": "Bye"\n}\n' > messages/en.json
	printf '# Requirements\n\n- REQ-001: first\n' > docs/requirements.md
	echo 'export const a = 1;' > src/a.ts
	git add -A
	git commit --quiet -m base
	git remote add origin "$origin"
	git push --quiet origin main
)

base=$(git -C "$seed" rev-parse HEAD)

# branch <name> <command…>: a branch from the base commit with one commit on it.
branch() {
	local name=$1
	shift
	(
		cd "$seed" || exit 1
		git checkout --quiet -B "$name" "$base"
		"$@"
		git add -A
		git commit --quiet -m "$name"
		git push --quiet origin "$name"
	)
}

add_message() { node -e '
	const fs = require("fs");
	const m = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));
	m[process.argv[1]] = process.argv[2];
	fs.writeFileSync("messages/en.json", JSON.stringify(m, null, "\t") + "\n");
' "$1" "$2"; }
add_requirement() { echo "- $1" >> docs/requirements.md; }
change_code() { echo "export const a = $1;" > src/a.ts; }
add_file() { echo "$1" > "src/$1.ts"; }
all_of() { for step in "$@"; do eval "$step"; done; }

branch issue-1-clean add_file one
branch issue-2-messages add_message mine Mine
branch issue-3-third add_message third Third
branch issue-4-ledger add_requirement 'REQ-4-1: fourth'
branch issue-5-code change_code 5
branch issue-6-same-key add_message hello Hej
branch issue-7-not-waiting add_file seven
branch feature-x add_file feature

# main moves on: a message, a requirement and a code change.
(
	cd "$seed" || exit 1
	git checkout --quiet main
	add_message theirs Theirs
	node -e '
		const fs = require("fs");
		const m = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));
		m.hello = "Hello!";
		fs.writeFileSync("messages/en.json", JSON.stringify(m, null, "\t") + "\n");
	'
	add_requirement 'REQ-9-1: from main'
	change_code 9
	git add -A
	git commit --quiet -m 'main moves on'
	git push --quiet origin main
)
main_sha=$(git -C "$seed" rev-parse main)

# --- merge-main.sh ---------------------------------------------------------

clone=$work/clone
git clone --quiet "$origin" "$clone"

# merge_case <branch>: leaves the output in $out and the exit code in $code.
merge_case() {
	git -C "$clone" checkout --quiet --force -B "$1" "origin/$1"
	out=$(cd "$clone" && bash "$root/scripts/merge-main.sh" origin/main 2>&1)
	code=$?
}
expect_merged() {
	[[ $code -eq 0 ]] || fail "$1" "exit $code: $out"
	grep -qx merged <<< "$out" || fail "$1" "no 'merged' line: $out"
	git -C "$clone" merge-base --is-ancestor origin/main HEAD || fail "$1" "main is not in the branch"
	[[ -z $(git -C "$clone" status --porcelain) ]] || fail "$1" "work tree is not clean"
}
expect_untouched() {
	[[ $code -eq 3 ]] || fail "$1" "expected exit 3, got $code: $out"
	grep -qx "conflict:$2" <<< "$out" || fail "$1" "no 'conflict:$2' line: $out"
	[[ $(git -C "$clone" rev-parse HEAD) == $(git -C "$clone" rev-parse "origin/$1") ]] || fail "$1" "branch moved"
	[[ -z $(git -C "$clone" status --porcelain) ]] || fail "$1" "merge was not aborted"
}
message() { node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))[process.argv[2]] ?? "")' "$clone/messages/en.json" "$1"; }

merge_case issue-1-clean
expect_merged clean

merge_case issue-2-messages
expect_merged messages
[[ $(message mine) == Mine && $(message theirs) == Theirs && $(message hello) == 'Hello!' ]] ||
	fail messages "keys of both sides expected: $(cat "$clone/messages/en.json")"

merge_case issue-3-third
expect_merged third
[[ $(message third) == Third ]] || fail third "the branch's message was lost"

merge_case issue-4-ledger
expect_merged ledger
grep -q 'REQ-4-1' "$clone/docs/requirements.md" && grep -q 'REQ-9-1' "$clone/docs/requirements.md" ||
	fail ledger "both requirements expected: $(cat "$clone/docs/requirements.md")"
if grep -q '^[<=>]\{7\}' "$clone/docs/requirements.md"; then fail ledger "conflict markers left"; fi

merge_case issue-5-code
expect_untouched issue-5-code src/a.ts

merge_case issue-6-same-key
expect_untouched issue-6-same-key messages/en.json

git -C "$clone" checkout --quiet --force -B main origin/main
out=$(cd "$clone" && bash "$root/scripts/merge-main.sh" origin/main 2>&1)
[[ $out == up-to-date ]] || fail up-to-date "got: $out"

# --- sync-branches.sh ------------------------------------------------------

mkdir "$work/bin"
cat > "$work/bin/gh" <<'SHIM'
#!/usr/bin/env bash
# Serves `pr list` and `issue view` from $STUB; logs every other call. `run list`
# answers what start-ci.sh asks for (the id of a held run), from $STUB/held-<branch>.
case "$1 $2" in
'pr list') cat "$STUB/prs.json" ;;
'issue view') cat "$STUB/issue-$3.json" ;;
'run list')
	while [[ $# -gt 0 && $1 != --branch ]]; do shift; done
	[[ ! -f "$STUB/held-$2" ]] || cat "$STUB/held-$2"
	;;
api*) [[ -z ${REFUSE_APPROVE:-} ]] || exit 1; echo "gh $*" >> "$STUB/calls" ;;
*) echo "gh $*" >> "$STUB/calls" ;;
esac
SHIM
chmod +x "$work/bin/gh"

stub=$work/stub
mkdir "$stub"
n=10
prs=''
for b in issue-1-clean issue-2-messages issue-3-third issue-5-code issue-7-not-waiting feature-x; do
	n=$((n + 1))
	prs+="{\"number\":$n,\"headRefName\":\"$b\",\"isCrossRepository\":false},"
done
echo "[${prs%,}]" > "$stub/prs.json"
for i in 1 2 3 5; do
	echo '{"labels":[{"name":"status:needs-human"}],"comments":[]}' > "$stub/issue-$i.json"
done
echo '{"labels":[{"name":"status:needs-dev"}],"comments":[]}' > "$stub/issue-7.json"

# issue-1-clean has its pull_request run held for approval; issue-2-messages has none.
echo 9001 > "$stub/held-issue-1-clean"

# No waiting for the held run in the check.
export GH_REPO=test/repo CI_POLL_TRIES=1 CI_POLL_SLEEP=0

sync=$work/sync
git clone --quiet "$origin" "$sync"
: > "$stub/calls"
log=$(PATH="$work/bin:$PATH" STUB=$stub GITHUB_OUTPUT=$work/output bash "$root/scripts/sync-branches.sh" "$sync" 2>&1) ||
	fail sync "exit $?: $log"

git -C "$seed" fetch --quiet origin
contains_main() { git -C "$seed" merge-base --is-ancestor "$main_sha" "origin/$1"; }
for b in issue-1-clean issue-2-messages issue-3-third; do
	contains_main "$b" || fail sync "$b was not merged with main on origin"
done
for b in issue-5-code issue-7-not-waiting feature-x; do
	if contains_main "$b"; then fail sync "$b must not be touched"; fi
done
grep -qx 'handled=11 12 13' "$work/output" || fail sync "handled output: $(cat "$work/output")"
grep -qx 'gh api -X POST repos/test/repo/actions/runs/9001/approve' "$stub/calls" || fail sync "held CI run not approved for issue-1-clean"
if grep -q 'ci.yml --ref issue-1-clean' "$stub/calls"; then fail sync "CI dispatched although a run was held for issue-1-clean"; fi
grep -qx 'gh workflow run ci.yml --ref issue-2-messages' "$stub/calls" || fail sync "CI not dispatched for issue-2-messages, which has no held run"
grep -qx 'gh workflow run ci.yml --ref issue-3-third' "$stub/calls" || fail sync "CI not dispatched for issue-3-third"
grep -q "can't resolve" <<< "$log" || fail sync "the unresolved conflict was not logged: $log"

# start-ci.sh falls back to a dispatch when the held run can't be approved.
: > "$stub/calls"
PATH="$work/bin:$PATH" STUB=$stub REFUSE_APPROVE=1 bash "$root/scripts/start-ci.sh" issue-1-clean abc123 > /dev/null 2>&1 ||
	fail start-ci "exit $?"
grep -qx 'gh workflow run ci.yml --ref issue-1-clean' "$stub/calls" || fail start-ci "no dispatch after a refused approval: $(cat "$stub/calls")"

# A second run finds nothing to do.
: > "$stub/calls"
PATH="$work/bin:$PATH" STUB=$stub GITHUB_OUTPUT=$work/output2 bash "$root/scripts/sync-branches.sh" "$sync" > /dev/null 2>&1
grep -qx 'handled=' "$work/output2" || fail sync-again "handled output: $(cat "$work/output2")"
[[ ! -s $stub/calls ]] || fail sync-again "unexpected calls: $(cat "$stub/calls")"

# A rejected push is reported once per main commit.
# Put the branch back to before the merge; the hook stands in for GitHub's refusal.
git -C "$origin" update-ref refs/heads/issue-1-clean "$(git -C "$seed" rev-parse 'origin/issue-1-clean^1')"
cat > "$origin/hooks/pre-receive" <<'HOOK'
#!/usr/bin/env bash
echo "refusing to allow a GitHub App to create or update workflow" >&2
exit 1
HOOK
chmod +x "$origin/hooks/pre-receive"
: > "$stub/calls"
PATH="$work/bin:$PATH" STUB=$stub GITHUB_OUTPUT=$work/output3 bash "$root/scripts/sync-branches.sh" "$sync" > /dev/null 2>&1
grep -q '^gh issue comment 1 --body-file ' "$stub/calls" || fail rejected "no comment about the rejected push: $(cat "$stub/calls")"
grep -qx 'handled=' "$work/output3" || fail rejected "a rejected push must not count as handled"
echo "{\"labels\":[{\"name\":\"status:needs-human\"}],\"comments\":[{\"body\":\"<!-- sync-rejected:$main_sha -->\"}]}" > "$stub/issue-1.json"
: > "$stub/calls"
PATH="$work/bin:$PATH" STUB=$stub GITHUB_OUTPUT=$work/output4 bash "$root/scripts/sync-branches.sh" "$sync" > /dev/null 2>&1
[[ ! -s $stub/calls ]] || fail rejected-again "the comment was repeated: $(cat "$stub/calls")"

if [[ $failed -eq 0 ]]; then
	echo "sync branches ok"
fi
exit $failed
