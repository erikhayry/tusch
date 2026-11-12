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
