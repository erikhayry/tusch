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

Each workflow has one job to do:

| Workflow       | Does                                                                |
| -------------- | ------------------------------------------------------------------- |
| `ci.yml`       | The one required check, `test` (see "CI")                           |
| `agents.yml`   | Runs a role skill when a label, comment or merge asks for one       |
| `pipeline.yml` | Upkeep with no AI: scripts that keep PRs mergeable and `main` green |
| `claude.yml`   | Ad-hoc `@claude` mentions; not part of the pipeline                 |

`agents.yml` runs the role skills:

| You do                                                                     | Runs                                                                               |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Add `status:idea` to an issue, or answer the planner's questions there     | `/plan <n>`                                                                        |
| Add `type:bug` to an issue that has no `status:*` label yet                | `/plan <n>` (the workflow adds `status:idea` first)                                |
| Add `status:needs-tests` (or a skill hands off to it)                      | `/test <n>` → `/develop` → `/reviewer`, each started by the previous stage's label |
| Comment or review on a pipeline PR while the issue is `status:needs-human` | `/triage <n>`                                                                      |
| Merge a pipeline PR (branch `issue-<n>-…`)                                 | `/tech-lead reconcile <pr>`                                                        |
| Nothing: Mondays 06:00 UTC, or dispatch `agents.yml` with `audit` ticked   | `/tech-lead audit`, then `/automate` (files token-saving `type:chore` issues)      |

### Pipeline upkeep

`pipeline.yml` runs when `main` moves, when a CI run finishes, when an issue
closes and every 15 minutes. It only acts on a pipeline PR (branch
`issue-<n>-…`) whose issue is `status:needs-human`; earlier stages are still
changing the code.

| When                                             | What happens (script)                                                                                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main` moved and the PR is behind it             | `main` is merged into the branch and CI runs again, so what you merge was tested against the `main` it lands on (`sync-branches.sh`, `merge-main.sh`)       |
| …and both sides added messages or requirements   | Merged per key (`messages/*.json`) or by keeping both sides' lines (`docs/requirements.md`)                                                                 |
| …and both sides changed a screenshot baseline    | `main`'s image is taken, the baselines are rendered again from the merged code and committed; look at them in the PR's diff                                 |
| …and anything else conflicts                     | `/develop <n>` merges `main` (`conflict-bounce.sh`; blocked after 2 rounds)                                                                                 |
| The `test` check fails on the PR's newest commit | `/develop <n>` with the failed steps and tests (`checks-bounce.sh`; blocked after 2 rounds)                                                                 |
| SonarCloud fails on the PR's newest commit       | `/develop <n>` with the findings (`sonar-bounce.sh`; blocked after 2 rounds)                                                                                |
| CI fails on `main`                               | The failed jobs run again once. A second failure opens one `main-broken` issue and starts `/plan` for it; it closes when `main` is green (`main-health.sh`) |
| A WIP slot is free                               | The oldest queued issues start (`pipeline-wip.sh`)                                                                                                          |

- A commit is sent back once. Moving a blocked issue back to `status:needs-human`
  without a new commit leaves it with you.
- While CI runs on the merged branch, the PR's `test` check is pending and the PR
  can't be merged. Turn on **auto-merge** for the PR instead of waiting: it merges
  when the check passes, and the next PR is then merged with `main` and tested in
  turn.
- The pipeline pushes with `GITHUB_TOKEN`, which may not push workflow files.
  After `main` changes a file in `.github/workflows/`, the merge into each open
  branch is yours: the issue gets one comment with the command to run.
- Pipeline scripts have no E2E layer; each has a check that runs it against
  fixtures or temporary git repositories (`pnpm run check:agent-fixtures`, a CI
  step).

- Only a **human** adding `type:bug` starts the planner. Bugs that agents file as
  follow-ups wait for you to add a `status:*` label. To skip planning for a bug
  with clear reproduction steps, add `status:needs-tests` at the same time (or
  instead): an issue that already has a `status:*` label isn't planned.
- Bare approvals, bot comments and `@claude` mentions don't start a stage
  (`@claude` goes to `claude.yml`).
- One agent runs per issue at a time. A failed or timed-out run sets
  `status:blocked` and links the run.
- **WIP limit: five issues in progress** (open and labelled `needs-tests`,
  `needs-dev`, `needs-review` or `needs-human`; #183 raised it from two). A sixth
  `status:needs-tests` issue gets the `queued` label and a comment instead of a
  `/test` run. When an issue is merged or closed (and every 15 minutes, which also
  catches a blocked one), the oldest queued issues start, one per free slot. `scripts/pipeline-wip.sh`
  holds the rule and the number (`limit`, default 5, `WIP_LIMIT` overrides it);
  local runs ignore it.
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
- `main` is protected: CI (`test`, see "CI") must pass; no force-push.
- PR body: what changed and why, `Closes #<n>`, the tests added, anything
  deliberately left out, follow-ups as new issues (not TODOs), and a
  **Release note**: one user-facing sentence, or "No user-facing change".
- **Changelog:** a user-facing change adds `changelog/<issue>.<type>.md` holding
  that sentence (`changelog/README.md`), in the same PR. One file per issue, so
  open PRs never conflict on it; never edit `CHANGELOG.md`. `pnpm run changelog`
  prints the whole list.
- Keep PRs focused: no unrelated formatting or refactors. File an issue instead.
- Commit messages: imperative subject; body explains why.
- Never commit secrets or `.env*` files.

## CI

`ci.yml` has one job, `test`, the only required check: typecheck, lint, the
requirements ledger, changelog entries, knip, the pipeline script checks and E2E.
It also fails when a commit by an agent changes `.github/` or `.claude/`
(`scripts/check-agent-commits.sh`).

- **Light scope:** when a change touches only `docs/`, `changelog/`, `.claude/`
  or top-level `*.md` files, the E2E suite is skipped (`scripts/ci-scope.sh`);
  the static checks still run. Nothing the app is built from changed, so a slow
  or flaky test can't hold up a docs PR.
- Runs on `main` are never cancelled: every merge gets its own result. On a
  branch, a newer run replaces the older one.
- A failed run lists the failed tests on its summary page
  (`scripts/ci-failures.mjs`).
- Don't fix CI by making a check weaker or by retrying. A flaky test is a bug:
  file it.

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
with the CI container tag and the screenshot baselines. Bump the `container:`
tag in `ci.yml`, `agents.yml` and `pipeline.yml`; until all match the locked version,
`pnpm run check:agent-fixtures` fails (`scripts/check-container-tags.sh`).
Changing those workflow files is a human step (see `agents.md`, "Workflow and
agent files").

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
