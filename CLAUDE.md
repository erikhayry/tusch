# Claude instructions

Tusch is a local-first SvelteKit (Svelte 5) app that turns a source article into
a comic using OpenAI. Comic metadata lives in `localStorage`, images in OPFS;
the server only proxies AI generation.

Build for real usage: features and tests must work for comics users create, not
only the bundled examples (`docs/rules/testing.md`, "Build for real usage").

Follow these rules (derived from the current code; update them in the same PR
when a convention changes):

@docs/rules/architecture.md
@docs/rules/code-style.md
@docs/rules/forms.md
@docs/rules/styling.md
@docs/rules/testing.md
@docs/rules/workflow.md

## Agent pipeline

Role skills live in `.claude/skills/` (`/plan`, `/test`, `/develop`, `/reviewer`,
`/triage`, `/tech-lead`, and `/automate`, which runs after the weekly audit). They
follow `docs/rules/agents.md` (labels, branches, comments, blocking) and `docs/agent-workflow-plan.md`. Subagents live in
`.claude/agents/`: `a11y-reviewer` (accessibility review; `/reviewer` runs it on
UI diffs), `css-reviewer` (styling conventions; `/reviewer` runs it on UI diffs)
and `pipeline-expert` (pipeline changes and token savings; `/reviewer` runs it on
pipeline diffs). Models per role: `docs/rules/agents.md`, "Models".

## Commands

| Task            | Command                             |
| --------------- | ----------------------------------- |
| Install         | `pnpm install`                      |
| Dev server      | `pnpm run dev`                      |
| Typecheck       | `pnpm run check`                    |
| Lint / format   | `pnpm run lint` / `pnpm run format` |
| Lint CSS only   | `pnpm run lint:css`                 |
| E2E (mocked AI) | `pnpm run test:e2e`                 |

## Plans

- `docs/agent-workflow-plan.md`: the agent pipeline (labels, roles); work packages AW0–AW13.
- `docs/data-flow-refactor-plan.md`: the completed refactor; background for the module boundaries.
