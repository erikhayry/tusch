# Styling

The global baseline lives in `src/app.css`, imported once in
`src/routes/+layout.svelte`. No CSS framework, no new dependency.

## Variables only

- Every colour, spacing, font size and family, line height, border width,
  radius and content width is a CSS custom property declared once in the
  `:root` token block of `src/app.css`. Everything outside that block uses
  `var(--…)`. Exception: the one `prefers-color-scheme: dark` block in
  `app.css` redeclares colour tokens only.
- Keyword values (`display: none`, `0`, `auto`, `100%`, `inherit`) are not
  "values" for this rule.
- Media queries can't read custom properties, so breakpoints are defined once,
  in a comment at the top of `app.css`. That is the only exception.

## Palette

- Warm greys for backgrounds, surfaces, text and borders (#294). Light and dark,
  from the same tokens: the dark scheme (`prefers-color-scheme`, no toggle) only
  overrides colour tokens in one block in `app.css`.
- Five semantic colours, each its own token: `--color-link` (links),
  `--color-danger` (error text and destructive actions such as Remove and ×),
  `--color-speaker` (dialogue speaker names), `--color-control-border` (field and
  button borders, 3:1 or better) and `--color-focus`. Link, danger and speaker
  text must pass 4.5:1 on the surfaces they sit on. Don't reuse one token for another role:
  a token is changed for its role, not for its look.
- `--color-focus` is used **only** for the focus indicator (`:focus-visible`
  `outline`). Never for text, links, buttons or state. It keeps 3:1 or better
  against the background in both schemes; the dark value is lighter than the
  light one, because the light focus blue is too dark on the dark background.
- Text colours must pass axe `color-contrast` (REQ-035).
- Fonts are self-hosted (Inter, `static/fonts/`, OFL licence beside the files).
  No request to a third-party font host (REQ-294-5).

## Order of work

1. Semantic HTML first: style elements (`button`, `input`, `select`, `label`,
   `a`, `main`, `h1`–`h6`, `ul`, `pre`, `img`) before adding classes. A component
   may use local classes in its own scoped `<style>` for its layout; global
   classes in `app.css` are not allowed.
2. Narrow screens second: the base styles target 320 px.
3. Wide screens last, with `min-width` media queries only (never `max-width`).

## Where styles go

- Global baseline in `src/app.css`.
- A component gets a scoped `<style>` block only for its own layout, and that
  block still uses tokens only.
- Declarations used by more than one component live in one place: a shared
  component (`components/dangerButton/DangerButton.svelte`), not copied into
  each component's `<style>` block.
- Set the outline only under `:focus-visible`; a resting outline breaks the
  REQ-038 test.

## Stylelint

`pnpm run lint` runs stylelint (`stylelint.config.js`, `pnpm run lint:css`) on
`src/app.css` and the `<style>` blocks of every `.svelte` file. It enforces:

- no colour literals (hex, `rgb()`/`hsl()`/…, named colours), no length units
  (`px`, `rem`, `em`, …) and no percentages other than `100%`, except custom
  property declarations in the `:root` blocks of `src/app.css` (the token block;
  `tusch/custom-property-in-root` rejects custom properties elsewhere in that
  file). `0` and keywords pass. A new value needs a token.
- no `max-*` or `device-*` media features, range syntax (`width <= …`) or
  `min-width` value other than the documented `48em` breakpoint
- `outline*` only in a rule whose selector contains `:focus-visible`
  (`stylelint-plugins/outline-focus-visible.mjs`; every selector in the list must
  qualify, and `:not(:focus-visible)` doesn't count); `outline: none` resets are
  not allowed

Font families, unitless line heights and font weights are not checked; they stay
with `css-reviewer`.

Judgement checks stay with the `css-reviewer`. `lint-staged` runs
`stylelint --fix` on staged `.css` and `.svelte` files.

## Tests

`/reviewer` runs the `css-reviewer` subagent on diffs that touch `.svelte` files
or CSS. It checks the conventions here that a linter can't judge.

REQ-035, REQ-037, REQ-038, REQ-039 and REQ-040 (no horizontal scroll at 320 px)
must pass. Every visual change updates the screenshot baselines
(`testing.md`, "Screenshots").
