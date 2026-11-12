# Architecture

Tusch is a local-first SvelteKit (Svelte 5) app. Comic metadata lives in
`localStorage`, images in OPFS; the server only proxies AI generation.

## Where code goes

| Concern                                                                         | Location                                                                             | Example                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Domain types (Zod)                                                              | `src/lib/types/`                                                                     | `index.ts` (`ComicSchema`, `PanelSchema`)                 |
| Route data schemas                                                              | `src/lib/types/routeData.ts`                                                         | `PanelPageDataSchema`                                     |
| Feature contract: action name, form decoding, value/result schemas, prompt DTOs | `src/lib/features/<feature>/contracts/`                                              | `panels/contracts/addCaption.ts`                          |
| Client state                                                                    | `src/lib/features/comics/client/`                                                    | `comic-store.svelte.ts`, `comic-selectors.ts`             |
| Domain commands (one aggregate update each)                                     | `src/lib/features/comics/client/comic-commands.ts`                                   | `addCaption`, `commitPanelImage`                          |
| Client commands bound to a form                                                 | `src/lib/features/<feature>/client/`                                                 | `panels/client/add-caption.ts`                            |
| Multi-step client workflows (assets + metadata)                                 | `src/lib/features/<feature>/client/workflows/`                                       | `panels/client/workflows/commit-generated-panel-image.ts` |
| Asset storage boundary                                                          | `src/lib/client/assets/`                                                             | `asset-store.ts`, `opfs-asset-store.ts`                   |
| Production wiring for workflows                                                 | `src/lib/client/workflow-deps.ts`                                                    |                                                           |
| Shared form plumbing                                                            | `src/lib/forms/`                                                                     | `enhance-action.ts`, `form-data.ts`                       |
| Components                                                                      | `src/lib/components/<name>/` (forms in `components/forms/<name>Form/`)               | `forms/addCaptionForm/`                                   |
| AI provider boundary                                                            | `src/lib/server/ai/`                                                                 | `ai-gateway.ts`, `openai-gateway.ts`, `mock-gateway.ts`   |
| Generation use cases                                                            | `src/lib/server/generation/generation-service.ts`                                    | `createComic`                                             |
| Server action handlers                                                          | `src/lib/server/actions/`                                                            | `generation-actions.ts`, `settings-actions.ts`            |
| Routes                                                                          | `src/routes/`                                                                        | see below                                                 |
| Translations                                                                    | `messages/en.json`, `messages/sv-se.json` → `m.key()` from `$lib/paraglide/messages` |                                                           |

`src/lib/utils/` is older shared code (AI prompt builders, crop, storage
primitives, `db/dbTypes.ts`). Extend it only when the code is genuinely shared;
new feature code goes under `features/`.

## Routes

- Every route that reads local comic state lives in the `src/routes/(local)/`
  group. Its `+layout.ts` sets `ssr = false` and calls `bootstrapComics()`
  **once**. Never add `ssr = false` or `bootstrapComics()` to a page.
- Page loads `await parent()`, read through selectors, and return complete data
  or `error(404, …)`. Example: `(local)/comic/[id]/[panel]/+page.ts`.
- Each `+page.server.ts` exports **only** the actions its forms post to, as a
  map keyed by the contract's action name. Example: `(local)/comic/[id]/+page.server.ts`.
  `(local)/test/actions.svelte.e2e.ts` (REQ-033) checks every route's map.
- `/settings` and `/api/ai/models` are outside the group and render on the server.

## Dependency rules

- `src/lib/server/**` must not import from `src/lib/components`, any
  `features/*/client`, `src/lib/client`, or `*.svelte.ts` state.
- Contracts must not import server or client code; both sides import contracts.
- Components call client commands or workflows; they never import storage
  (`utils/storage`), crop, ID generation or `comicStore` writes directly.
- Server code reaches the AI provider only through `AiGateway`
  (`getAiGateway(credentialsFromCookies(cookies))`), never the OpenAI SDK.
- Actions call `GenerationService` directly; never `event.fetch('/api/…')`.

## Data flow (one form submission)

1. A native `<form>` posts to `?/<action>` (see `forms.md`).
2. The contract decodes `FormData` explicitly and validates with Zod.
3. Server work (if any): action → `GenerationService` → `AiGateway`.
4. The shared enhancer handles loading and errors, then runs the client step.
5. The client step is a workflow (stage assets → one command) or a command.
6. The command makes one copy-on-write update to the store and one
   persistence write (`comic-persistence.ts`, versioned snapshot).
