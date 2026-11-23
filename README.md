# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.17.0 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" playwright sveltekit-adapter="adapter:vercel" paraglide="languageTags:en, sv-SE+demo:yes" ai-tools="ide:claude-code+delivery:plugin" --install bun tusch
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Generation API

Scripts can run the four server-backed generation steps over HTTP. Each takes a
JSON body with the same fields as its form, returns the same result as JSON, and
stores nothing on the server. Send your OpenAI key on every request:

```http
POST /api/generate/comic
Authorization: Bearer <OpenAI key>
Content-Type: application/json

{ "story": "A lighthouse keeper discovers that the fog carries messages.", "style": "anime" }
```

- `POST /api/generate/comic`: create a comic from `url` or `story`
- `POST /api/generate/cover-image`
- `POST /api/generate/panel`
- `POST /api/generate/panel-image`

The key is read only from the `Authorization` header; cookies and a server key are
never used. Failures are JSON `{ code, message }` (plus `fieldErrors` for invalid
input), with the same codes and statuses as the app's forms.
