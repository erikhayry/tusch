# Review lessons

Things human reviewers asked for on pipeline PRs that the reviewer agent
missed. `/reviewer` checks every entry; `/tech-lead reconcile` adds entries after
a merge (see `.claude/skills/tech-lead/SKILL.md`).

- One line per lesson: what to check, then the source PR, e.g.
  `- Crop previews use the character's own entry, not index 0 (#107).`
- Only lessons that generalise beyond one PR. A one-off fix is not a lesson.
- When a lesson becomes a convention, move it into the matching
  `docs/rules/*.md` file and delete it here. Keep at most 20 entries.

## Lessons

- Run the full `pnpm run lint` (Prettier on `.claude/`, docs and scripts, ESLint,
  `lint:deps`), not a subset, and check `gh pr checks` before reporting a PR as
  passing (#193).
- Derive return and prop types from Zod schemas (`.pick`, `.extend`); no handwritten inline object types for app-owned shapes (#195).
- Keep logic out of `.svelte` files and assign as few variables as possible; extract to a selector or util function (#195).
- E2E tests use a page object for locators and setup (`test/utils/`), so the test body reads as behaviour only (#195).
