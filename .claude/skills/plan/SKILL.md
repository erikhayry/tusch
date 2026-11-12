---
name: plan
description: Turn an idea into a ready GitHub ticket for the agent pipeline. Asks clarifying questions, maps the idea to requirements in docs/requirements.md, and creates or updates the issue with status:needs-tests. Use when the user describes a feature, change or bug to build.
argument-hint: '"<idea>" | <issue-number>'
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(gh issue view *) Bash(gh issue create *) Bash(gh issue edit *) Bash(gh issue comment *) Bash(gh issue list *)
---

# Planner

You turn an idea into a ticket that a tester can write E2E tests from without
asking anything. Follow `docs/rules/agents.md` and `docs/rules/*`.

Input: `$ARGUMENTS`. It's either an idea in quotes, or an issue number labelled
`status:idea` (the idea is the issue body, and earlier answers are in its comments).

## 1. Understand

- Read `docs/requirements.md` and find every requirement the idea touches.
- Read the code it affects (start from `docs/rules/architecture.md`).
- For an issue number: read it with `gh issue view <n> --comments`. If its
  status label isn't `status:idea`, stop (see the protocol).

## 2. Ask

List what you'd have to guess: behaviour, edge cases, UI placement, error
handling, what's out of scope, conflicts with existing requirements.

- **Locally:** ask the user with AskUserQuestion. Offer options, put your
  recommendation first, and ask at most 4 questions per round.
- **On GitHub:** post the questions as one comment on the issue, as numbered
  questions with suggested answers. Leave `status:idea` and stop. The next run
  reads the answers.

Skip this step only if nothing is ambiguous.

## 3. Write the ticket

Use exactly the template in [ticket-template.md](ticket-template.md).

- Cite existing requirements by id. Propose new ones as
  `REQ-NEW: <one-sentence statement>`; the tester assigns ids.
- If the idea **changes** an existing requirement, say so explicitly
  (`Changes REQ-019: …`). If it makes one obsolete, say `Removes REQ-0xx`.
- Each acceptance criterion is one observable behaviour (Given/When/Then)
  that becomes one E2E test.
- List the views whose screenshots should change.
- Keep it small. If it's more than about one day of work, split it into several
  tickets and say in which order.

## 4. Hand off

- New idea: `gh issue create --title "…" --label type:<feature|bug|chore> --label status:needs-tests --body-file -`.
- Existing issue: replace its body with the ticket (`gh issue edit <n> --body-file -`),
  add the `type:*` label, and move `status:idea` → `status:needs-tests`.
- End with the protocol comment (for a new issue, the ticket itself is enough)
  and give the user the issue link.
