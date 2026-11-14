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

| You do                                                                             | Runs                                                                               |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Add `status:idea` to an issue, or answer the planner's questions there             | `/plan <n>`                                                                        |
| Add `type:bug` to an issue that has no `status:*` label yet                        | `/plan <n>` (the workflow adds `status:idea` first)                                |
| Add `status:needs-tests` (or a skill hands off to it)                              | `/test <n>` → `/develop` → `/reviewer`, each started by the previous stage's label |
| Comment or review on a pipeline PR while the issue is `status:needs-human`         | `/triage <n>`                                                                      |
| Merge a pipeline PR (branch `issue-<n>-…`)                                         | `/tech-lead reconcile <pr>`                                                        |
| Nothing: SonarCloud fails on a pipeline PR while the issue is `status:needs-human` | `/develop <n>` with the findings (blocked after 2 rounds)                          |
| Nothing: Mondays 06:00 UTC, or dispatch `agents.yml` with `audit` ticked           | `/tech-lead audit`, then `/automate` (files token-saving `type:chore` issues)      |

- Only a **human** adding `type:bug` starts the planner. Bugs that agents file as
  follow-ups wait for you to add a `status:*` label. To skip planning for a bug
  with clear reproduction steps, add `status:needs-tests` at the same time (or
  instead): an issue that already has a `status:*` label isn't planned.
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
- **Bookkeeping:** every agent run on GitHub appends a row (skill, model,
  turns, tokens, estimated cost, run link) to `costs.csv` on the `bookkeeping`
  branch and updates one "Cost so far" comment on the issue. The cost is an
  API-price estimate, not the subscription bill. `scripts/costs.mjs` reads the
  rows and totals them; the weekly audit copies them to `docs/costs.csv`.
  Local runs aren't recorded.
- **Trust:** `trust.csv` on the same branch measures how far to trust the
  agents (#181). A `/plan` run that classifies the human's answers adds a `plan`
  row (asked, accepted, changed), and a merged pipeline PR adds a `pr` row
  (review comments, changes requested, `/triage` rounds, `clean`). Bots don't
  count. `scripts/trust.mjs` writes the rows and summarises them; the weekly
  audit copies the file to `docs/trust.csv` and `docs/trust.md` and reports a
  "Trust" section. It only measures; it never changes what the agents do.

## Branches and PRs

- One issue, one branch, one PR. Branch from `main` as `issue-<n>-<slug>`.
  **Never stack PRs**: `main` deletes merged branches, but a stack merged
  out of order still misses `main`.
- `main` is protected: CI (`test`: typecheck, lint, requirements check, knip,
  E2E) must pass; no force-push.
- PR body: what changed and why, `Closes #<n>`, the tests added, anything
  deliberately left out, follow-ups as new issues (not TODOs), and a
  **Release note**: one user-facing sentence, or "No user-facing change". After
  a pipeline PR merges, the tech lead copies the note into `CHANGELOG.md`.
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

## Vercel

Vercel deploys `main` only (`vercel.json`, `git.deploymentEnabled`); branches
and PRs get no preview deployments. Production has no server API key: AI
features need the visitor's own key in Settings. Try a branch locally with
`pnpm run dev`.

## Error monitoring (Sentry)

`@sentry/sveltekit` reports errors from the browser (`src/hooks.client.ts`) and
the server (`src/instrumentation.server.ts`, `handleError` in
`src/hooks.server.ts`) to the Sentry project `erik-portin-vz/tusch`.

- It's on only where `PUBLIC_SENTRY_DSN` is set: Vercel production. Local dev,
  CI and E2E runs send nothing.
- Privacy (`src/lib/sentry-options.ts`): no cookies, headers, request bodies,
  query params, local variables, user info or AI inputs/outputs. Anything that
  looks like an OpenAI key is masked. Keep it that way: the key must never leave
  the server (REQ-029).
- Readable stack traces need source maps: set `SENTRY_AUTH_TOKEN` in Vercel and
  the build uploads them (optional).

## Dependencies

Dependabot (`.github/dependabot.yml`) opens grouped weekly PRs for npm
packages and GitHub Actions. They go through CI like any PR; the agents ignore
them (bot sender). `@playwright/test` is excluded: bump it by hand together
with the CI container tag and the screenshot baselines.

**Cooldown:** pnpm installs only versions published at least 7 days ago
(`minimumReleaseAge` in `pnpm-workspace.yaml`; `pnpm install --frozen-lockfile`
rejects a lockfile that breaks it), and Dependabot waits 7 days before
proposing a release. To add a newer package, pick a version older than 7 days
(`npm view <pkg> time`); don't relax the policy.

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
