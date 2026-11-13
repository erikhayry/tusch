# Workflow

## Issues and labels

- Work is tracked in GitHub issues. Labels are defined in `.github/labels.yml`
  (sync: `scripts/sync-labels.sh`).
- `status:*` is the pipeline state; an issue has exactly one. Only pick up an
  issue whose label matches your role, and finish by swapping it to the next
  state (see `docs/agent-workflow-plan.md`, §3 and §4).
- If you can't finish (ambiguous requirement, repeated failures, turn/time cap),
  set `status:blocked` and comment **why** and what a human must decide.
- `type:bug` work starts with an E2E test that reproduces the bug.

## Running the pipeline on GitHub

`.github/workflows/agents.yml` runs the role skills automatically:

| You do                                                                     | Runs                                                                             |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Add `status:idea` to an issue, or answer the planner's questions there     | `/plan <n>`                                                                      |
| Add `status:needs-tests` (or a skill hands off to it)                      | `/test <n>` → `/develop` → `/review`, each started by the previous stage's label |
| Comment or review on a pipeline PR while the issue is `status:needs-human` | `/triage <n>`                                                                    |
| Merge a pipeline PR (branch `issue-<n>-…`)                                 | `/tech-lead reconcile <pr>`                                                      |

- Bare approvals, bot comments and `@claude` mentions don't start a stage
  (`@claude` goes to `claude.yml`).
- One agent runs per issue at a time. A failed or timed-out run sets
  `status:blocked` and links the run.
- **WIP limit: two issues in progress** (open and labelled `needs-tests`,
  `needs-dev`, `needs-review` or `needs-human`). A third `status:needs-tests`
  issue gets the `queued` label and a comment instead of a `/test` run. When an
  issue is merged, closed or blocked (and every 30 minutes), the oldest queued
  issue starts. `scripts/pipeline-wip.sh` holds the rule; local runs ignore it.
- To take over by hand, run the same skill locally (`/develop 42`) or move the label yourself.

## Branches and PRs

- One issue, one branch, one PR. Branch from `main` as `issue-<n>-<slug>`.
  **Never stack PRs**: `main` deletes merged branches, but a stack merged
  out of order still misses `main`.
- `main` is protected: CI (`test`: typecheck, lint, requirements check, knip,
  E2E) must pass; no force-push.
- PR body: what changed and why, `Closes #<n>`, the tests added, anything
  deliberately left out, and follow-ups as new issues (not TODOs).
- Keep PRs focused: no unrelated formatting or refactors. File an issue instead.
- Commit messages: imperative subject; body explains why.
- Never commit secrets or `.env*` files.

## Git hooks

Installed automatically by `pnpm install` (`simple-git-hooks`, configured in `package.json`):

| Hook       | Runs                                                             |
| ---------- | ---------------------------------------------------------------- |
| pre-commit | Prettier + ESLint `--fix` on **staged files** (`lint-staged`)    |
| pre-push   | `pnpm run check`, `pnpm run lint`, `pnpm run check:requirements` |

E2E runs in CI, not in hooks. Use `--no-verify` only in an emergency, and say so in the PR.

## Vercel previews

Vercel deploys every pushed branch and comments the Preview link on its PR.
The branch URL is `https://tusch-git-<branch>-erik-hyrys-projects.vercel.app`
(Vercel shortens it with a hash when it exceeds 63 characters, so prefer the
link in Vercel's comment). Previews have no server API key: AI features need
the visitor's own key in Settings. The reviewer links the affected views in
the PR's **Try it** section.

## Dependencies

Dependabot (`.github/dependabot.yml`) opens grouped weekly PRs for npm
packages and GitHub Actions. They go through CI like any PR; the agents ignore
them (bot sender). `@playwright/test` is excluded: bump it by hand together
with the CI container tag and the screenshot baselines.

## Before pushing

```sh
pnpm run check
pnpm run lint
pnpm run test:e2e
```

Report results honestly in the PR, including skipped or flaky tests.

## Docs to keep current

- `docs/data-flow-refactor-plan.md`: done (reference for module boundaries)
- `docs/agent-workflow-plan.md`: the pipeline being built
- `docs/rules/*`: update in the same PR when a convention changes
