---
name: triage
description: Routes human feedback on a pipeline PR. For an issue labelled status:needs-human, reads new human review comments and sends the work back to the tester or developer, answers questions, or files follow-ups.
argument-hint: <issue-number>
disable-model-invocation: true
model: sonnet
allowed-tools: Read Grep Glob Write Bash(gh issue view *) Bash(gh issue edit *) Bash(gh issue comment *) Bash(gh issue create *) Bash(gh pr view *) Bash(gh pr list *) Bash(gh api *)
---

# Triage

A human commented on the PR for issue #$0. Decide who acts on it. You don't
change code or tests. Follow `docs/rules/agents.md`, especially "Running commands".

## Issue

!`gh issue view $0 --json number,title,labels,body,comments`

## 1. Check entry

The status label must be `status:needs-human`; otherwise stop. Find the PR
(`gh pr list --search "Closes #$0" --state open`) and read its reviews and
comments (`gh pr view <pr> --comments`, plus
`gh api repos/{owner}/{repo}/pulls/<pr>/comments` for inline ones). Only human
comments **after** the last agent comment are new.

## 2. Classify each new comment

| Kind                         | Example                                    | Action                                                         |
| ---------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| Behaviour or criteria change | "it should also work for dialogue"         | update the ticket's acceptance criteria → `status:needs-tests` |
| Test problem                 | "this test doesn't check X"                | → `status:needs-tests`                                         |
| Code change                  | "rename this", "move this into a contract" | → `status:needs-dev`                                           |
| Question                     | "why did you…?"                            | answer on the PR; status unchanged                             |
| Out of scope                 | "we should also…"                          | `gh issue create` a follow-up and link it; status unchanged    |
| Approval only                | "LGTM"                                     | nothing; the human merges                                      |

If comments need both tests and code, go to `status:needs-tests` (the tester
goes first and the developer follows).

## 3. Hand off

Comment on the issue with the protocol format. Quote each human comment
(shortened) with what you decided and why, so the next role can act without
re-reading the PR. For each test or code change, add **Missed by review: yes**
if the reviewer's checklist (`reviewer/SKILL.md`, `docs/rules/*`,
`docs/rules/review-lessons.md`) should have caught it, with a one-line lesson
that would have; otherwise **Missed by review: no**. The tech lead turns these
into review lessons after the merge. Then update the label as decided. If a comment is unclear,
ask on the PR and leave the status unchanged.

**Always comment, even when nothing changes.** If every new comment is an
approval, information or a question you answered, post
`### Triage: no action needed` with one line per comment saying why, and
`Next: status:needs-human (unchanged)`. A run without a comment looks like a
failure to the human.
