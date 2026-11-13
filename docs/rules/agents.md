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
  Later roles reuse it (`git fetch`, then `git switch issue-<n>-…`).
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

## Running commands

Skills pre-approve narrow command patterns (e.g. `Bash(gh pr create *)`), and on
GitHub nobody is there to approve anything else. So:

- **One plain command per Bash call.** No `&&`, `;`, pipes, `$(…)`, heredocs,
  `sleep` or loops; they don't match the patterns and get denied.
- **Multi-line text goes into a file.** Write comment and PR bodies to
  `.agent-tmp/<name>.md` (gitignored), then pass the file:
  `gh issue comment <n> --body-file .agent-tmp/comment.md`.
- Edit files with Edit/Write, not `sed -i`, `perl -pi` or `cp`.
- Screenshot baselines: `pnpm screenshots:update` renders them in CI and copies
  them into `src/`; don't download or copy them by hand.
- **Inspect files with Read, Glob and Grep**, not `ls`, `cat`, `du`, `file`,
  `find` or `wc`; those aren't on any role's allow list.
- **A denial doesn't end your run.** Split the command into allowed single
  commands (or use Read/Glob/Grep) and carry on. Every run ends with your
  protocol comment and a label move; a run that just stops is blocked
  automatically ("ended without handing off").
- **Never wait for approval.** If a command you need is denied twice, block (see
  below) and include the exact command in your comment.

## Models

Use the cheapest model that does the job well; tokens are the pipeline's main
cost (`costs.csv`, the "Cost so far" comment on each issue).

| Role                                   | Model    | Why                                                     |
| -------------------------------------- | -------- | ------------------------------------------------------- |
| `/plan`, `/review`, `/tech-lead audit` | `opus`   | Judgement: scoping, catching what others missed         |
| `/test`, `/develop`                    | `sonnet` | Implementation against a clear ticket and failing tests |
| `/triage`, `/tech-lead reconcile`      | `sonnet` | Routine classification and bookkeeping                  |
| `a11y-reviewer`, `css-reviewer`        | inherit  | Run inside `/review`, so they use its model             |
| `pipeline-expert`                      | `opus`   | Set in `.claude/agents/pipeline-expert.md`              |

The model is set twice and must match: `model:` in each skill's frontmatter
(local runs) and the `model` case in `agents.yml` (GitHub). One exception: a skill has
one model, so `/tech-lead audit` runs on `sonnet` locally (switch with
`/model opus` first if you want the GitHub behaviour). Anything that needs
no judgement (gathering facts, formatting, label moves, fixed check lists) is a
script or workflow step, not an agent turn; `pipeline-expert` looks for these.

## Workflow and agent files

Agents never change `.github/workflows/` or `.claude/` (skills, subagents,
settings). The agents' GitHub App has no `workflows` permission, and the
agents' Write tool was refused for `.claude/` files (#84). Keep it that way, so
agents can't change their own permissions, models, turn caps, instructions or
CI gates. For a new or changed skill or subagent, post the full file content in
the comment the same way.

When a ticket needs a workflow or agent-file change:

1. Do everything else first, and push it.
2. Put the exact change in your protocol comment as a ```diff block per file
   (or the full content of a new file),
   plus one line on why.
3. Set `status:blocked` with the decision "apply the workflow diff". A human
   applies it on the branch, pushes, and moves the label back to your stage.

The planner flags workflow changes in the ticket ("needs a human-applied
workflow change"), so it's expected rather than a surprise.

## Follow-ups

Anything you find that is outside the ticket (a slow view, a flaky test, a
rule that should change) becomes a new issue, never a TODO in code:

1. Search first (`gh issue list --search "<words>" --state open`) and link an
   existing issue instead of duplicating it.
2. Otherwise write the body to `.agent-tmp/followup-<n>.md` and run
   `gh issue create --title "…" --label type:bug|type:feature|type:chore --body-file .agent-tmp/followup-<n>.md`.
   Say where it was found (`Found while working on #<n>`). Don't add a
   `status:*` label; a human decides when it enters the pipeline.
3. Reference the new issue where it matters (a code comment next to a
   temporary workaround, the PR body, your protocol comment).

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
  its ids. REQ-001 … REQ-052 are legacy sequential ids. Every new requirement
  is scoped to the issue that adds it: `REQ-<issue>-<n>` (REQ-98-1, REQ-98-2),
  so tickets running in parallel can't take the same id (#165).
  `check:requirements` rejects new sequential ids.
- The **planner** proposes new requirements in the ticket (`REQ-NEW: …`).
- The **tester** adds them to the ledger as `REQ-<issue>-<n>` and tags the
  tests that prove them, so `pnpm run check:requirements` passes.
- The **tech lead** edits wording, removes obsolete requirements, and audits
  coverage; it never weakens a requirement to make a test pass.

## Checks

Before pushing, run each of these as its own command (the pre-push hook also
runs the first three):

```sh
pnpm run check
pnpm run lint
pnpm run check:requirements
pnpm run knip
pnpm run test:e2e
```

Report results honestly in your comment: what ran, what passed, what didn't.
