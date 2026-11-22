---
name: develop
description: Developer role for the agent pipeline. Implements an issue labelled status:needs-dev on its branch until the tester's E2E tests and the full suite pass, then hands it to review.
argument-hint: <issue-number>
disable-model-invocation: true
model: haiku
allowed-tools: Read Grep Glob Edit Write Bash
---

# Developer

You make issue #$0's tests pass with the smallest change that follows the rules.
Follow `docs/rules/agents.md` (especially "Running commands") and every file in
`docs/rules/`.

## Issue

!`gh issue view $0 --json number,title,labels,body,comments`

## 1. Check entry

The status label must be `status:needs-dev`; otherwise stop. Switch to the
issue's branch (`git fetch`, then `git switch issue-$0-…`, then `git pull`), and read
the tester's comment and any reviewer or triage feedback.

**CI failed.** If the latest pipeline comment starts with `### Pipeline: CI failed`
(`scripts/checks-bounce.sh`), the PR's `test` check failed after review. Fix the
failed steps and tests it lists, then run step 3 in full, and steps 4 and 5.

**Merge conflict with `main`.** If the latest pipeline comment starts with
`### Pipeline: merge conflict with main`, the branch has to merge `main` first
(`scripts/conflict-bounce.sh`, #168). The pipeline has already tried: it merges
`main` into waiting PRs itself and resolves message files and the requirements ledger,
so what reaches you needs a decision:

- `git fetch origin`, then `git merge origin/main`. Never rebase or force-push.
- Resolve each conflict, then commit the merge (`Refs #$0`).
- An id clash in `docs/requirements.md`: keep both entries.
- Then run step 3 in full, and steps 4 and 5. Block if a conflict is beyond you.

## 2. Implement

- Read the failing tests first; they are the spec. Then read
  `docs/rules/architecture.md` and `forms.md` and follow the existing path
  (contract → command or workflow → form/component → route action map), the way
  `add caption` did.
- **Don't edit the tester's tests.** If one is wrong (e.g. it contradicts the
  ticket), block and explain; don't make it pass by changing it. Fixing an
  obvious typo is fine; say so in your comment.
- For `Removes REQ-…`: delete the requirement and its now-obsolete tests together.
- Svelte components: Svelte 5 runes only; run the Svelte autofixer if it's
  available.

## 3. Verify

Run each as its own command:

```sh
pnpm exec playwright test -g "<each new test>"    # now passing
pnpm run check
pnpm run lint
pnpm run check:requirements
pnpm run knip
pnpm run test:e2e                                  # full suite
```

Repeat until everything passes. Two failed attempts at the same problem means
block.

## 4. Changelog entry

If the change is visible to users, write one sentence for them in
`changelog/$0.<type>.md`, where the type follows the issue's label: `feature`
(`type:feature`), `fix` (`type:bug`) or `chore` (`type:chore`). One line, no
list marker, no link (`changelog/README.md`). Never edit `CHANGELOG.md`. Skip the
file when nothing user-facing changed, and say so in your comment.

## 5. Hand off

Commit (`Refs #$0`, explaining why in the body), then `git push`. Comment with
the protocol format: what changed (files), why it's built that way, what you ran
and its results. Then move
`status:needs-dev` → `status:needs-review`. Don't open the PR; the reviewer does.
