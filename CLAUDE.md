# Claude instructions

@AGENTS.md

## Project

Tusch is a local-first SvelteKit (Svelte 5) app that turns a source article into a
comic using OpenAI. Comic metadata lives in `localStorage`, images in OPFS; the
server only proxies AI generation.

## Ongoing refactor

`docs/data-flow-refactor-plan.md` is the source of truth for the data-flow
refactor. When working on an issue that references a work package (WP), read that
section first, follow its constraints, and tick the checklist items you complete.

Key boundaries already in place:

- Forms: native `<form method="POST" use:enhance>` with `enhanceAction` /
  `enhanceClientCommand` (`src/lib/forms`).
- Contracts: `src/lib/features/*/contracts` own decoding and Zod schemas.
- Client state: `src/lib/features/comics/client` (store, commands, selectors,
  persistence, workflows). Asset writes go through `AssetStore`.
- Server: `src/lib/server` — `AiGateway` → `GenerationService` → route-scoped
  actions in each `+page.server.ts`. Server code must not import components or
  client state.

## Commands

- Install: `pnpm install`
- Typecheck: `pnpm run check`
- Unit/component tests: `pnpm exec vitest run`
- E2E (mocked AI): `pnpm run test:e2e`

Run typecheck and the relevant tests before opening a PR. E2E runs against canned
AI responses (`PLAYWRIGHT_TEST=true`), never the real API.

## Pull requests

- One issue per PR, small and reviewable; reference the issue (`Closes #N`).
- Don't fix unrelated formatting or lint issues in the same PR.
- Never commit secrets or `.env` files.
