# Testing

## E2E is the only test layer

- Write Playwright E2E tests only. **Do not add unit or component tests**
  (`*.spec.ts`, `*.svelte.spec.ts`). Existing Vitest tests stay until E2E covers
  the same behaviour, then they are deleted (plan AW5). Don't extend them.
- Goal: every feature/requirement has at least one E2E test.
- `pnpm generate` (plop) still scaffolds unit-test files; delete them or don't
  use that part of the output.

## Where and how

- Tests live next to their route: `src/routes/**/test/*.svelte.e2e.ts`, with a
  page object in `test/utils/` (e.g. `(local)/comic/create/test/utils/createPage.ts`).
- Navigate with `gotoHydrated(page, url)` (`src/tests/e2e/gotoHydrated.ts`), or
  a page object's async `goto()` that uses it. It waits for `<html data-hydrated>`;
  interacting earlier can turn a submit into a native POST.
- Select by role and accessible name using the translation, not raw strings:
  `page.getByRole('button', { name: m.addCaption() })`. Use `{ exact: true }`
  when text could also match a label (`getByText` is case-insensitive).
- Always `await expect(locator)…` web-first assertions.
- Each test starts from fresh storage (Playwright context); examples are seeded
  by the app. Create data through the UI when a test needs a user-made comic
  (see `createComic` in `(local)/test/navigation.svelte.e2e.ts`).

## AI is always mocked

E2E runs against a production build with `PLAYWRIGHT_TEST=true`, which swaps in
`src/lib/server/ai/mock-gateway.ts` (canned responses from
`src/tests/mock/openAi/openAiResponse.ts`). Never call the real API.

Drive failures from the UI with markers in submitted text:

- `mock-error:auth`, `mock-error:rate-limit`, `mock-error:upstream`: the gateway
  throws that error (any request whose messages, or API key, contain the marker)
- an API key containing `invalid`: key validation returns `success: false`

## Running

- `pnpm run test:e2e` builds and runs everything (Chromium).
- One area: `pnpm exec playwright test comic/create`. Parentheses in paths are
  regex, so escape them or pass a substring.
- Before pushing: `pnpm run check`, `pnpm run lint`, and the full E2E suite.
  For flakiness, `rm -rf build && pnpm run test:e2e` (cold) and `--repeat-each`.

## Coming with the workflow plan

- AW3: tests carry requirement tags (`{ tag: '@REQ-012' }`), checked in CI.
- AW6: committed screenshot baselines for every view (`toHaveScreenshot`).
