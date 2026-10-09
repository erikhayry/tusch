// vite.config.ts
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

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
		}),

		svelteTesting(),
	],
	test: {
		expect: { requireAssertions: true },
		setupFiles: ['./src/tests/setup.ts'],
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }],
					},
					// Explicitly force browser module resolution for Svelte imports
					server: {
						deps: {
							inline: [/svelte/],
						},
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
				},
				// Force Vite resolution to target the browser entry points
				resolve: {
					conditions: ['browser'],
				},
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'jsdom',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
				},
			},
		],
	},
});
