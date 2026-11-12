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

## Naming

- Newer modules use kebab-case file names (`comic-commands.ts`,
  `enhance-action.ts`); contracts and components use camelCase/PascalCase
  (`addCaption.ts`, `AddCaptionForm.svelte`). Follow the convention of the
  folder you are in.
- Schemas end in `Schema` (`AddCaptionValuesSchema`), action names in `_ACTION`.
- Svelte 5 runes only (`$props`, `$state`, `$derived`, `$effect`); no legacy
  `export let` or stores.

## Results and errors

- Domain commands return `CommandResult` (`{ ok: true } | { ok: false, code, message }`)
  and never throw for expected failures; callers use `expectCommitted`.
- Workflows return `WorkflowResult` (adds rollback and cleanup info); forms use `expectWorkflow`.
- Expected server failures return `fail(status, { code, message })`; provider failures are
  mapped in `server/actions/run-action.ts` (`toActionFailure`). Unexpected ones become
  `error(502, message)` with an actionable message.
- Never surface raw JSON or "Internal Error" to the user.

## Comments

Comment the _why_: constraints, ordering, non-obvious trade-offs (see the
comments in `(local)/+layout.ts` and `asset-workflow.ts`). Don't narrate what
the code does.
