# Agent protocol

Shared rules for the role skills in `.claude/skills/` (`/plan`, `/test`,
`/develop`, `/review`, `/triage`, `/tech-lead`). The pipeline itself is
described in `docs/agent-workflow-plan.md`. These rules apply both locally
and on GitHub.

## State

- An issue has exactly one `status:*` label. Read it first; **if it isn't your
  entry label, stop without changing anything** and say which label you expected.
- Finish by moving the issue to the next state in a single command:
  `gh issue edit <n> --remove-label <current> --add-label <next>`.
- Never skip a state. Never set `status:needs-human` yourself unless you are the
  reviewer and the PR exists.

| Skill        | Entry label                  | Exit label(s)                                                           |
| ------------ | ---------------------------- | ----------------------------------------------------------------------- |
| `/plan`      | none or `status:idea`        | `status:needs-tests` (or stays `status:idea` while waiting for answers) |
| `/test`      | `status:needs-tests`         | `status:needs-dev`                                                      |
| `/develop`   | `status:needs-dev`           | `status:needs-review`                                                   |
| `/review`    | `status:needs-review`        | `status:needs-human`, or back to `needs-dev` / `needs-tests`            |
| `/triage`    | `status:needs-human`         | `status:needs-dev`, `status:needs-tests`, or unchanged                  |
| `/tech-lead` | any (it doesn't move issues) | none                                                                    |

## Branches

- One branch per issue: `issue-<n>-<slug>`, created from `main` by the tester.
  Later roles reuse it (`git fetch && git switch issue-<n>-…`).
- Never stack branches, force-push, or rewrite pushed history.
- Commit messages: imperative subject, a body explaining why, and
  `Refs #<n>` (the PR body carries `Closes #<n>`).

## Comments

Every role ends with **one** issue comment, in this shape:

```md
### <Role>: <one-line outcome>

- What I did (files, tests, decisions)
- What the next role needs to know
- Anything left out on purpose

Next: `status:<next>`
```

Keep it short. Link files and commits rather than pasting code.

## Blocking

Set `status:blocked` (removing the current status) and comment the reason
**and the decision a human must make** when:

- the ticket is ambiguous or contradicts `docs/requirements.md`,
- you've tried twice and the same check still fails,
- you'd need to change something outside your role (e.g. the developer finding a
  wrong test), or
- you're near your turn or time budget.

Don't guess. A clear block is better than a wrong PR.

## Requirements ledger

- `docs/requirements.md` is the source of truth for behaviour; tickets cite
  `REQ-nnn` ids.
- The **planner** proposes new requirements in the ticket (`REQ-NEW: …`).
- The **tester** adds them to the ledger with the next free id and tags the
  tests that prove them, so `pnpm run check:requirements` passes.
- The **tech lead** edits wording, removes obsolete requirements, and audits
  coverage; it never weakens a requirement to make a test pass.

## Checks

Before pushing (`pnpm` scripts; the pre-push hook runs the first three):

```sh
pnpm run check && pnpm run lint && pnpm run check:requirements && pnpm run knip
pnpm run test:e2e
```

Report results honestly in your comment: what ran, what passed, what didn't.
