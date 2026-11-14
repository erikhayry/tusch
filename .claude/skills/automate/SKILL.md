---
name: automate
description: Weekly automater. Reads what agents actually did last week (repeated commands, permission denials, re-reads) and files type:chore issues proposing scripts or workflow steps that save tokens. Runs after /tech-lead audit; finds and files, never implements.
disable-model-invocation: true
model: sonnet
allowed-tools: Read Grep Glob Write Bash(gh issue list *) Bash(gh issue view *) Bash(gh issue create *) Bash(gh issue comment *)
---

# Automater

You find agent work that a script, a workflow step or a cheaper model could do,
and file it as issues. You never implement anything: no code, no PRs, no label
moves. Follow `docs/rules/agents.md` (especially "Running commands" and
"Follow-ups").

## 1. Inputs

Read only what you need:

- `.agent-tmp/audit-actions.md`: last week's agent runs, summarised from their
  digests (tool calls, repeated commands, permission denials, re-read files).
  `scripts/audit-inputs.sh` wrote it before this job ran.
- `docs/costs.md`: cost per issue, skill and week.
- The skill, subagent or workflow files a proposal would change, so you can
  name the change precisely.

If `audit-actions.md` says "No digests.", skip to step 4 and report that.

## 2. Find savings

Use the categories from `.claude/agents/pipeline-expert.md`, "Finding savings":

1. **Deterministic replacement:** a step agents repeat that a script or a
   workflow step could do with no tokens.
2. **Model change:** a role whose work is mechanical on the cheaper model, or
   one that keeps failing on it.
3. **Turn waste:** repeated failing commands, permission denials, re-reading
   the same files.
4. **Context waste:** large injected context or files a skill makes the agent
   read but never use.

Keep a proposal only if it names the exact change (file and what to do) and
estimates the saving from the counts and `costs.csv`. Say when you're guessing.

## 3. File issues

For each proposal, at most **5** per run:

1. Check "Open type:chore issues" at the end of `audit-actions.md` first; if
   one already covers it, link that one instead. Only search GitHub
   (`gh issue list --search …`) when the list says it couldn't be loaded.
2. Otherwise write the body to `.agent-tmp/automate-<n>.md` and run
   `gh issue create --title "…" --label type:chore --body-file .agent-tmp/automate-<n>.md`.
   No `status:*` label: a human decides when it enters the pipeline.

The body has the evidence (counts and run links from the digest), the proposed
change, and the estimated saving. Never include prompts, file contents or
secrets.

## 4. Report

Add **one** comment to the open "Weekly tech-lead audit" issue
(`gh issue list --search "Weekly tech-lead audit in:title" --state open`) with
an **Automation savings** section: the issues you filed or linked, or "No new
savings found". Never create a second audit issue.
