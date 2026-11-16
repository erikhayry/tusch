# Changelog entries

One file per issue, so two open PRs never edit the same lines.

- Name: `<issue>.<type>.md`, where the type follows the issue's label:
  `feature` (`type:feature`), `fix` (`type:bug`) or `chore` (`type:chore`).
  Example: `238.feature.md`.
- Content: one user-facing sentence on a single line. No list marker, no link;
  the issue link is added when the changelog is printed.
- No entry when the change has no user-facing effect.

The developer adds the file on the issue's branch (`/develop`), and the reviewer
checks it against the PR's **Release note**. Print the whole changelog with
`pnpm run changelog`; CI checks the files with `pnpm run check:changelog`.
