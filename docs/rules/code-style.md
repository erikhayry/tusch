# Code style

Formatting is enforced by Prettier (`prettier.config.js`: tabs, single quotes,
trailing commas, width 100) and ESLint. Run `pnpm run lint`; fix with
`pnpm run format`.

## Zod-first data types

- For every application-owned runtime data shape (domain entities, route data,
  form and action inputs/results, persisted snapshots, API payloads, DTOs),
  define a Zod schema as the source of truth.
- Derive TypeScript types with `z.infer`, `z.input` or `z.output`. Do not keep a
  parallel handwritten interface or type alias for the same shape.
- Use `z.input` for values before transforms and `z.output` after.
- Validate untrusted data at boundaries: form submissions, persisted storage,
  API requests, route params, external service responses.
- Reuse and compose schemas (`.pick`, `.extend`) instead of duplicating fields.
  Example: `ValidateApiKeyResultSchema` is reused as the gateway's `PingResultSchema`.
- Keep framework- and library-owned types as imported TypeScript types. No Zod
  schemas that only mirror framework callbacks, utility types, snippets or HTML
  attributes.
- Component props: schema the app-owned fields (e.g. `panelTypes.ts`,
  `addCaptionFormTypes.ts`) and keep framework types for attributes.
- Behaviour contracts (`AiGateway`, `AssetStore`) are TypeScript interfaces;
  the data they pass is still Zod.

## Svelte MCP

The Svelte plugin (`svelte@svelte`) is enabled in `.claude/settings.json`, and
`agents.yml` installs it for agents on GitHub. When you write or edit a
`.svelte` or `.svelte.ts` file, run its `svelte-autofixer` tool on the file
until it reports no issues, and look up Svelte or SvelteKit APIs with
`list-sections` / `get-documentation` instead of guessing.

## Naming

- Newer modules use kebab-case file names (`comic-commands.ts`,
  `enhance-action.ts`); contracts and components use camelCase/PascalCase
  (`addCaption.ts`, `AddCaptionForm.svelte`). Follow the convention of the
  folder you are in.
- Schemas end in `Schema` (`AddCaptionValuesSchema`), action names in `_ACTION`.
- Svelte 5 runes only (`$props`, `$state`, `$derived`, `$effect`); no legacy
  `export let` or stores.

## No non-null assertions

- Never use the `!` operator. Narrow with a guard (`?.`, `if`, `{#if}`) and
  render or return nothing when data is missing. ESLint enforces it
  (`@typescript-eslint/no-non-null-assertion`).
- Exception: E2E tests and their helpers (`*.e2e.ts`, `test/utils/`,
  `src/tests/`) may use `!`; a wrong assumption fails the test instead of
  crashing the app. The rule is turned off for those files in `eslint.config.js`.

## Results and errors

- Domain commands return `CommandResult` (`{ ok: true } | { ok: false, code, message }`)
  and never throw for expected failures; callers use `expectCommitted`.
- Workflows return `WorkflowResult` (adds rollback and cleanup info); forms use `expectWorkflow`.
- Expected server failures return `fail(status, { code, message })`; provider failures are
  mapped in `server/actions/run-action.ts` (`toActionFailure`). Unexpected ones become
  `error(502, message)` with an actionable message.
- Never surface raw JSON or "Internal Error" to the user.

## Unused code

`pnpm run knip` (in CI) fails on unused files, exports, types and
dependencies. Export only what another module imports (exports used only inside
their own file are ignored); delete dead code instead of keeping it "for later".

## Duplication

Keep duplication as low as possible, in app and test code alike (SonarCloud
gates new duplicated lines at 3%). Share a helper instead of copying one, and
parametrise tests that differ in one step. Never fix duplication with
`sonar.cpd.exclusions`; it is only for fixture data (`src/examples/**`).

## User-visible text

- Every user-visible string (labels, alt text, `aria-label`, buttons, empty
  states) is a message in both `messages/en.json` and `messages/sv-se.json`,
  used as `m.key()`. No hard-coded text in components.
- This includes strings already in a component you touch but didn't write:
  translate them in the same PR.

## Comments

Comment the _why_: constraints, ordering, non-obvious trade-offs (see the
comments in `(local)/+layout.ts` and `asset-workflow.ts`). Don't narrate what
the code does.
