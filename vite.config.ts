// vite.config.ts
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
			},
			adapter: adapter(),
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
});
