# Testing

## E2E is the only test layer

- Write Playwright E2E tests only. There is no unit-test runner: Vitest and all
  unit/component tests were removed (AW5). Don't add `*.spec.ts` files.
- Every requirement in `docs/requirements.md` has at least one E2E test.
- Prove behaviour through the UI (or an HTTP request, as in
  `(local)/test/actions.svelte.e2e.ts`); inject failures with test-only hooks
  (`mock-error:` markers, `page.addInitScript`, `page.route`) rather than mocks
  of internal modules.
- `pnpm generate page` scaffolds a route with an E2E test and a page object.

## Where and how

- Tests live next to their route: `src/routes/**/test/*.svelte.e2e.ts`, with a
  page object in `test/utils/` (e.g. `(local)/comic/create/test/utils/createPage.ts`).
- Navigate with `gotoHydrated(page, url)` (`src/tests/e2e/gotoHydrated.ts`), or
  a page object's async `goto()` that uses it. It waits for `<html data-hydrated>`;
  interacting earlier can turn a submit into a native POST.
- Drive the UI by keyboard only (REQ-037): no `.click()`, `.fill()`, `.check()`
  or `.selectOption()` on controls. Use the helpers in
  `src/tests/e2e/keyboard.ts`: `tabTo` (Tab until focused, asserted with
  `toBeFocused()`), `activate` (Enter/Space), `typeInto`, `chooseOption`
  (`<select>`). The one exception is file inputs, which may use
  `setInputFiles` because a native file dialog can't be driven. Wait for
  `gotoHydrated` before pressing keys. A lint rule is deliberately not used;
  this is a convention.
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

## Build for real usage

- Features and tests must work for what users actually do: comics they create,
  not only the bundled examples.
- A test setup must not use a shortcut real users can't reach (e.g. seeded
  example data when the feature must also work on a created comic). If the mock
  blocks a real-usage scenario, fix the mock instead of working around it.
- When a test deviates from the ticket's setup, the real-usage scenario must
  still be covered.

## Running

- `pnpm run test:e2e` builds and runs everything (Chromium).
- One area: `pnpm exec playwright test comic/create`. Parentheses in paths are
  regex, so escape them or pass a substring.
- Before pushing: `pnpm run check`, `pnpm run lint`, and the full E2E suite.
  For flakiness, `rm -rf build && pnpm run test:e2e` (cold) and `--repeat-each`.

## Accessibility

- `src/tests/e2e/a11y.e2e.ts` runs axe (`@axe-core/playwright`) on every view
  in `src/tests/e2e/views.ts`, in both the light and the dark colour scheme, and
  fails on **any** violation (REQ-035). It runs
  locally too, unlike the screenshots.
- A new view goes in `views.ts`, which gives it both a screenshot and an axe
  scan.
- Pages render through `Page.svelte`, which sets the document title and the
  `<main>` landmark. Every form control needs a label (a visible `<label>`, or
  `aria-label` when there's no room for one).

## Performance

- `src/tests/e2e/webVitals.e2e.ts` (REQ-039) audits `landing`, `comic` and
  `panel` from `views.ts` with Lighthouse CI (`@lhci/cli`, desktop preset,
  Playwright's Chromium, median of 3 runs) against the preview server on port
  4173 and fails on any metric over budget. This is the one place a non-
  Playwright tool runs, and it is still driven from a tagged Playwright test
  (`webVitals/audit.ts`), so `check:requirements` sees it.
- The budget (LCP 2500 ms, CLS 0.1, TBT 200 ms) lives in
  `src/tests/e2e/webVitals/budget.ts`. A view that misses it gets a temporary
  entry in `VIEW_BUDGET_OVERRIDES` above its measured median, linking the ticket
  that fixes it. If CI variance causes flakes, widen headroom; don't retry.
- It always runs in CI. Locally it is skipped unless `PLAYWRIGHT_WEB_VITALS=1`
  (it takes about 2 minutes).

## Requirements

- Every E2E test proves one or more requirements from `docs/requirements.md`
  and carries their ids as Playwright tags:
  `test('add caption', { tag: ['@REQ-019', '@REQ-022'] }, async ({ page }) => …)`.
  Tag a `test.describe` to cover all its tests.
- A new behaviour needs a requirement (the tech lead adds it) and a tagged test
  in the same PR. Closing a gap: tag the test and delete `gap` from the entry.
- Skipped tests must not be tagged; they prove nothing.
- `pnpm run check:requirements` (in CI) fails on unknown or duplicate ids,
  untested active requirements, stale gaps and tagged skipped tests.
- Run the tests for one requirement: `pnpm exec playwright test --grep @REQ-019`.

## Screenshots

- `src/tests/e2e/screenshots.e2e.ts` captures every view in `views.ts` with
  `toHaveScreenshot()`. **A new view gets a screenshot test in the same PR.**
  `landing`, `comic` and `settings` also have dark baselines (`*-dark.png`).
- Baselines live in `src/tests/e2e/__screenshots__/` and are **Linux-only**: CI
  runs inside `mcr.microsoft.com/playwright:<version>-noble` (keep the tag in
  sync with `@playwright/test`). Locally the screenshot tests are skipped unless
  `PLAYWRIGHT_SCREENSHOTS=1`; macOS images won't match, so never commit them.
- **Intended UI change:** push the branch, run `pnpm screenshots:update` (it
  runs CI with `update_screenshots` and downloads the new baselines), look at
  the images, and commit them. GitHub's image diff in the PR is the visual review.
- A missing baseline fails CI with a "commit these baselines" error; the images
  are in the run's `screenshots` artifact. Diffs of failed comparisons are in
  `screenshot-diffs`.
- Keep views deterministic: mock gateway, seeded examples, no time-dependent
  content. Mask anything volatile (`mask: [locator]`) rather than retrying.
