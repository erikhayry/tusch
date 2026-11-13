// vite.config.ts
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sentrySvelteKit } from '@sentry/sveltekit/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Source maps are uploaded only where SENTRY_AUTH_TOKEN is set (optional, Vercel).
	const { SENTRY_AUTH_TOKEN } = loadEnv(mode, process.cwd(), 'SENTRY_');

	return {
		plugins: [
			sentrySvelteKit({
				adapter: 'vercel',
				autoUploadSourceMaps: Boolean(SENTRY_AUTH_TOKEN),
				org: 'erik-portin-vz',
				project: 'tusch',
				authToken: SENTRY_AUTH_TOKEN,
			}),
			sveltekit({
				compilerOptions: {
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				},
				adapter: adapter(),
				// Sentry's server init (src/instrumentation.server.ts) runs before the app.
				experimental: { instrumentation: { server: true } },
			}),

			paraglideVitePlugin({
				project: './project.inlang',
				outdir: './src/lib/paraglide',
				emitTsDeclarations: true,
				// v3 defaults the Vite plugin to virtual message modules. E2E tests import
				// `$lib/paraglide/messages` in plain Node (Playwright), which can't load
				// `virtual:` URLs, so keep real files on disk.
				outputStructure: 'message-modules',
			}),
		],
	};
});
