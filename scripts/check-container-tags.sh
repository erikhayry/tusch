#!/usr/bin/env bash
# Checks that every `container:` in the workflows (ci.yml, agents.yml) uses the Playwright image
# whose tag matches the @playwright/test version locked in pnpm-lock.yaml (issue #243).
# A drifted tag would run the agents' E2E checks with a different browser build than CI uses.
# The lockfile is the reference, not package.json, whose range (^1.60.0) doesn't pin a version.
#
# Usage: scripts/check-container-tags.sh [root]   (root defaults to the repo)
set -uo pipefail

root=${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}
failed=0

problem() {
	echo "FAIL: $1" >&2
	failed=1
}

# A read loop, not mapfile: macOS ships bash 3.2, and this also runs on dev machines.
locked=()
while IFS= read -r found; do
	locked+=("$found")
done < <(grep -oE '@playwright/test@[0-9]+\.[0-9]+\.[0-9]+' "$root/pnpm-lock.yaml" | sed 's/^@playwright\/test@//' | sort -u)
if [[ ${#locked[@]} -ne 1 ]]; then
	problem "pnpm-lock.yaml must pin exactly one @playwright/test version, found ${#locked[@]}"
	exit 1
fi
version=${locked[0]}

# ci.yml and agents.yml must run in the image; any other workflow that names a
# container must use the same tag.
for name in ci.yml agents.yml; do
	file=$root/.github/workflows/$name
	if [[ ! -f $file ]]; then
		problem "$name is missing at $file"
	elif ! grep -q 'container:' "$file"; then
		problem "$name has no container: line; expected mcr.microsoft.com/playwright:v$version-noble"
	fi
done

for file in "$root"/.github/workflows/*.yml; do
	[[ -f $file ]] || continue
	name=$(basename "$file")
	while IFS= read -r line; do
		[[ -n $line ]] || continue
		image=$(grep -oE 'mcr\.microsoft\.com/playwright:v[0-9.]+-noble' <<< "$line" | head -1)
		if [[ $image != "mcr.microsoft.com/playwright:v$version-noble" ]]; then
			tag=${image:-none}
			problem "$name container tag is ${tag#mcr.microsoft.com/playwright:}, expected v$version-noble to match @playwright/test $version in pnpm-lock.yaml (line: ${line#*:})"
		fi
	done < <(grep -n 'container:' "$file")
done

if [[ $failed -eq 0 ]]; then
	echo "container tags match @playwright/test $version"
fi
exit $failed
