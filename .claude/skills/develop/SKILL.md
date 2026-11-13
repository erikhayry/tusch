---
name: develop
description: Developer role for the agent pipeline. Implements an issue labelled status:needs-dev on its branch until the tester's E2E tests and the full suite pass, updates screenshot baselines, then hands it to review.
argument-hint: <issue-number>
disable-model-invocation: true
model: sonnet
allowed-tools: Read Grep Glob Edit Write Bash(gh issue view *) Bash(gh issue edit *) Bash(gh issue comment *) Bash(gh issue list *) Bash(gh issue create *) Bash(gh workflow run *) Bash(gh run *) Bash(git *) Bash(pnpm *)
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
- New views or UI: add or extend screenshots (`src/tests/e2e/screenshots.e2e.ts`).

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

## 4. Screenshots

If the ticket lists views affected, or your change alters any view:

- **In the CI container** (`PLAYWRIGHT_SCREENSHOTS=1` is set): run
  `pnpm exec playwright test screenshots --update-snapshots=all` and commit the
  images.
- **Locally:** push first, then run `pnpm screenshots:update`. It renders the
  baselines in CI and copies them into `src/tests/e2e/__screenshots__/` itself,
  so don't download or copy them by hand. Look at the changed images, then
  commit them.

## 5. Hand off

Commit (`Refs #$0`, explaining why in the body), then `git push`. Comment with
the protocol format: what changed (files), why it's built that way, what you ran
and its results, and screenshots updated (yes/no). Then move
`status:needs-dev` → `status:needs-review`. Don't open the PR; the reviewer does.
