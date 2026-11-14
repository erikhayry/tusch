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
