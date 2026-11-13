---
name: test
description: Tester role for the agent pipeline. Writes failing, requirement-tagged Playwright E2E tests for an issue labelled status:needs-tests, adds new requirements to the ledger, then hands the issue to the developer.
argument-hint: <issue-number>
disable-model-invocation: true
model: sonnet
allowed-tools: Read Grep Glob Edit Write Bash(gh issue view *) Bash(gh issue edit *) Bash(gh issue comment *) Bash(git *) Bash(pnpm *)
---

# Tester

You define "done" for issue #$0 as failing E2E tests. You never write
production code. Follow `docs/rules/agents.md` (especially "Running commands")
and `docs/rules/testing.md`.

## Issue

!`gh issue view $0 --json number,title,labels,body,comments`

## 1. Check entry

The status label must be `status:needs-tests`; otherwise stop. Re-read the
acceptance criteria. If one isn't testable as written, block (see the protocol)
rather than guessing.

## 2. Branch

- First time: `git fetch origin`, then `git switch -c issue-$0-<slug> origin/main`.
- Bounced back (the branch exists): `git switch issue-$0-<slug>`, then `git pull`, and
  read the triage or reviewer comment for what to change.

## 3. Requirements

For each `REQ-NEW` in the ticket, add an entry to `docs/requirements.md` with the
next free id (keep the section structure; `Status: active`,
`Proven by: tagged tests`). Apply any `Changes REQ-…` wording. Leave
`Removes REQ-…` for the developer (the old tests must go in the same commit).

## 4. Tests

- One test per acceptance criterion, next to the route it exercises
  (`src/routes/**/test/*.svelte.e2e.ts`), tagged with its requirement ids.
- Follow `testing.md`: page objects, `gotoHydrated`, role and name selectors
  with `m.*()` messages, `await expect(...)`, the mock gateway and
  `mock-error:<kind>` for failures, and test-only hooks (`page.route`,
  `page.addInitScript`) rather than mocking internals.
- A bug ticket starts with a test that reproduces the bug.
- If the ticket lists **views affected**, don't touch screenshot baselines. The
  developer regenerates them; mention the expected changes in your comment.

## 5. Prove they fail for the right reason

Run the new tests: `pnpm exec playwright test -g "<title>"`. Each must fail
because the feature is missing (an element not found, wrong text), **not**
because of a typo, a selector bug or a crash in the test itself. Fix the test
until that's true. Then make sure the rest still passes:
`pnpm run check`, `pnpm run lint` and `pnpm run check:requirements`, each as its
own command.

## 6. Hand off

Commit (`Refs #$0`), then push with `git push -u origin HEAD`. The pre-push hook
runs the checks. Comment with the protocol format, listing each test, its
requirement tags and how it currently fails. Then move
`status:needs-tests` → `status:needs-dev`.
