# Forms

## The pattern

Every user action is a native SvelteKit form:

```svelte
<form method="POST" action={`?/${ADD_CAPTION_ACTION}`} use:enhance={handleSubmit}>
```

No form library and no state-management library.

## Contract first

Each operation has a contract in `features/<feature>/contracts/<operation>.ts`
that owns:

- the action name (`ADD_CAPTION_ACTION`; client-only operations reuse
  `CLIENT_ACTION_NAME` = `client`)
- `decode<Op>Values(formData)` with an explicit reader per field
  (`readString`, `readInteger`, `readCheckbox`, `readJsonField` from
  `src/lib/forms/form-data.ts`); never JSON-parse every field
- the values schema, the result schema (if server-backed), and a
  `get<Op>Values(formData)` that returns `safeParse`

Hidden inputs are written with `encodeFormValue(value)`.

## Three enhancers

| Kind          | Use                                                               | Example                                                                |
| ------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Server-backed | `enhanceAction<Result>(({ data, update }) => …)`                  | `CreatePanelImageForm.svelte`, `LoginForm.svelte`, `ConfigForm.svelte` |
| Client-only   | `enhanceClientCommand(getValues, command, ({ update }) => …)`     | `AddCaptionForm.svelte`, `DeleteItemForm.svelte`                       |
| Local-only    | `enhanceLocalCommand(getValues, command, { onStart, onSuccess })` | `GlobalInstructionsForm.svelte`                                        |

Use `enhanceLocalCommand` only for browser-only state with no server step and no
route action (REQ-033). It validates, runs the command synchronously and cancels
the request, so a reload right after Save can't lose the change. The form has no
`?/<action>`; show feedback in an always-rendered `role="status"` element.

The enhancers own loading (a request counter), error display, duplicate-submit
protection and failure handling. Components never touch `globalLoading` or
`globalError`; only `Loader.svelte` and `Error.svelte` read them.

The client step runs **only after** a successful action result. Server-backed
forms call a workflow (`commitGeneratedCover`, `commitGeneratedPanelImage`) or
`update()`; client-only forms call a command and then `update()`, which also
resets the form.

## Adding a feature (the WP7 path)

`add caption` is the reference (PR #18). It needed:

1. a contract (`panels/contracts/addCaption.ts`)
2. a domain command (`comicCommands.addCaption`)
3. a client command (`panels/client/add-caption.ts`)
4. a form component and its placement (`AddCaptionForm.svelte`, `Panel.svelte`)
5. messages in both locale files
6. an E2E test

No action registry, generic parser, edit/delete switch or OPFS code changed.
If a feature needs server work, add a handler in `src/lib/server/actions/` and
add it to **only** the route maps that render the form.
