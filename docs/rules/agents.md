# Agent protocol

Shared rules for the role skills in `.claude/skills/` (`/plan`, `/test`,
`/develop`, `/reviewer`, `/triage`, `/tech-lead`, `/automate`). The pipeline itself is
described in `docs/agent-workflow-plan.md`. These rules apply both locally
and on GitHub.

## State

- An issue has exactly one `status:*` label. Read it first; **if it isn't your
  entry label, stop without changing anything** and say which label you expected.
- Finish by moving the issue to the next state in a single command:
  `gh issue edit <n> --remove-label <current> --add-label <next>`.
- Never skip a state. Never set `status:needs-human` yourself unless you are the
  reviewer and the PR exists.

| Skill        | Entry label                    | Exit label(s)                                                           |
| ------------ | ------------------------------ | ----------------------------------------------------------------------- |
| `/plan`      | none or `status:idea`          | `status:needs-tests` (or stays `status:idea` while waiting for answers) |
| `/test`      | `status:needs-tests`           | `status:needs-dev`                                                      |
| `/develop`   | `status:needs-dev`             | `status:needs-review`                                                   |
| `/reviewer`  | `status:needs-review`          | `status:needs-human`, or back to `needs-dev` / `needs-tests`            |
| `/triage`    | `status:needs-human`           | `status:needs-dev`, `status:needs-tests`, or unchanged                  |
| `/tech-lead` | any (it doesn't move issues)   | none                                                                    |
| `/automate`  | none (weekly, after the audit) | none; files `type:chore` issues, never moves labels                     |

## Branches

- One branch per issue: `issue-<n>-<slug>`, created from `main` by the tester.
  Later roles reuse it (`git fetch`, then `git switch issue-<n>-…`).
- Never stack branches, force-push, or rewrite pushed history.
- Commit messages: imperative subject, a body explaining why, and
  `Refs #<n>` (the PR body carries `Closes #<n>`).
- While an issue waits in `status:needs-human`, the pipeline may add commits to
  its branch: a merge of `main`, and regenerated screenshot baselines
  (`docs/rules/workflow.md`, "Pipeline upkeep"). So always `git pull` before you
  work on a branch, and never force-push.
- A user-facing change carries its changelog entry on the branch:
  `changelog/<issue>.<type>.md`, written by the developer and checked by the
  reviewer (`changelog/README.md`). Nobody edits `CHANGELOG.md`.

## Comments

Every role ends with **one** issue comment. The reader is a human who has to act
on it and the next agent, who has little context. Write for both:

```md
### <Role>: <outcome in one line>

Do next: <the one thing the reader must do, or "nothing">

- <what changed or was found, one line each, at most 5>

Next: `status:<next>`
```

Rules (adapted from [i-have-adhd](https://github.com/ayghri/i-have-adhd)):

1. **Lead with the action.** The line after the heading says what the human or
   next role does. A decision a human must make goes there, as one question with
   your recommendation.
2. **Hard limit: 10 lines and 1,200 characters.** Detail goes in the diff, the
   tests or the PR body, never the thread. Link files (`path:line`) and commits.
3. **No recap.** Don't restate the ticket, earlier comments, your branch or your
   steps. The next role reads the diff.
4. **Checks: one line.** `check, lint, knip, e2e: pass`. For a failure, paste only
   the failing test name and its first error line.
5. **Number what a human must do**, one bounded action per step, with a time
   estimate in minutes when it is not instant.
6. **Cap lists at 5 items**, most important first. If more matter, say how many
   more and where they are.
7. **Errors are matter-of-fact**: cause, then fix. No apologies, no "unfortunately".
8. **No preamble or closers**: no "I've now…", "Let me know…", "Hope this helps".
9. **Tangents become follow-up issues** (see "Follow-ups"), not paragraphs.
10. **Tickets** follow `ticket-template.md`: a short problem, one line per
    criterion, and no copy of what a test or the code already says.

When a role blocks, the first line is the decision a human must make.

**Trust marker (planner only).** When `/plan` writes the ticket after the human
answered its questions, its comment carries one hidden line
`<!-- trust:plan asked=<n> accepted=<n> changed=<n> -->`. The planner counts each
answered question, not each comment: an answer that matches the suggestion is
accepted, anything else is changed, and "all suggestions" accepts every one
(`accepted + changed = asked`). A run that only asks questions, or skips asking,
adds no marker. `scripts/trust.mjs` reads the latest marker (#181).

## Skill names

A skill's name must not match a built-in Claude Code command or alias. The
built-in wins: `/review` became an alias of Claude Code's `/code-review`, so our
reviewer, then called `/review`, silently ran the built-in code review instead
(three silent stops on #98). The reviewer is now `/reviewer`. Check the
`commands` list in a run's init message when adding a skill.

## Running commands

On GitHub nobody is there to approve a command, so each role's tools are fixed
(`allowed-tools` in the skill, `--allowedTools` in `agents.yml`; keep them equal):

- **`/test`, `/develop` and `/reviewer` have a plain shell** (`Bash`). They run
  the project's tooling, and narrow patterns denied every compound command
  (`a && b | tail`), which was the most common reason a run stopped without
  handing off. Pipes, `&&` and `$(…)` are fine for these roles.
- **`/plan`, `/triage`, `/tech-lead` and `/automate` keep narrow patterns**
  (e.g. `Bash(gh issue comment *)`): they only read and comment. For them it is
  **one plain command per Bash call**, with no `&&`, `;`, pipes, `$(…)`, heredocs,
  `sleep` or loops; those don't match the patterns and get denied. They also
  inspect files with Read, Glob and Grep, not `ls`, `cat` or `find`.

A shell doesn't change what a role may do. For every role:

- **Multi-line text goes into a file.** Write comment and PR bodies to
  `.agent-tmp/<name>.md` (gitignored), then pass the file:
  `gh issue comment <n> --body-file .agent-tmp/comment.md`. The Write tool
  creates `.agent-tmp/` itself; never run `mkdir` (it is denied).
- Edit files with Edit/Write, not `sed -i`, `perl -pi` or `cp`. The reviewer has
  no Edit on purpose and doesn't change code through the shell either.
- Never change `.github/` or `.claude/` (see "Workflow and agent files"), never
  force-push or rewrite history, and never read or print tokens or other secrets
  from the environment.
- Screenshot baselines: run `pnpm screenshots:update`. Inside the CI container
  (agent runs on GitHub: `GITHUB_ACTIONS=true` and `PLAYWRIGHT_SCREENSHOTS=1`) it
  renders the baselines in place, with no dispatch and no download. That is the
  same image as `ci.yml`, so the baselines match CI; `pnpm run check:agent-fixtures`
  fails if the two container tags drift apart. Elsewhere it pushes the branch,
  renders the baselines in CI, then copies them into `src/`. Either way, don't
  download or copy them by hand.
- **A denial doesn't end your run.** Split the command into allowed single
  commands (or use Read/Glob/Grep) and carry on. Every run ends with your
  protocol comment and a label move; a run that just stops is blocked
  automatically ("ended without handing off").
- **Never run anything in the background, and never end your turn to wait.**
  On GitHub the run ends when you stop, and background work is lost (#100).
  Run commands in the foreground with a long timeout, and do subagent checks
  inline (see `/reviewer`).
- **Never wait for approval.** If a command you need is denied twice, block (see
  below) and include the exact command in your comment.

## Models

Use the cheapest model that does the job well; tokens are the pipeline's main
cost (`costs.csv`, the "Cost so far" comment on each issue).

| Role                                                                              | Model    | Why                                                     |
| --------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| `/plan`, `/tech-lead audit`                                                       | `opus`   | Judgement: scoping the work, auditing the pipeline      |
| `/develop`                                                                        | `haiku`  | Implementation against a clear ticket and failing tests |
| `/test`, `/reviewer`                                                              | `sonnet` | Writing tests and reviewing diffs against the rules     |
| `/triage`, `/tech-lead reconcile`                                                 | `sonnet` | Routine classification and bookkeeping                  |
| `/automate`                                                                       | `sonnet` | Works from a pre-aggregated digest; 40 turns at most    |
| Review subagents (`a11y-`, `css-`, `ux-reviewer`, `pipeline-expert`, `db-expert`) | inherit  | Applied inside `/reviewer`, so they use its model       |

The model is set twice and must match: `model:` in each skill's frontmatter
(local runs) and the `model` case in `agents.yml` (GitHub). One exception: a skill has
one model, so `/tech-lead audit` runs on `sonnet` locally (switch with
`/model opus` first if you want the GitHub behaviour). Anything that needs
no judgement (gathering facts, formatting, label moves, fixed check lists) is a
script or workflow step, not an agent turn; `pipeline-expert` looks for these.

## Workflow and agent files

Agents never change `.github/` or `.claude/` (skills, subagents, settings). The
agents' GitHub App has no `workflows` permission, and CI fails a PR in which a
commit by `claude[bot]` touches either directory
(`scripts/check-agent-commits.sh`). Keep it that way, so
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
