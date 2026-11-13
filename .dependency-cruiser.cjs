// Import rules from docs/rules/architecture.md ("Dependency rules").
// Run: pnpm run lint:deps (also part of CI). A rule change goes in the same PR
// as the architecture.md change it enforces.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		{
			name: 'server-stays-server',
			comment:
				'src/lib/server must not import components, client code (features/*/client, src/lib/client) or *.svelte.ts state.',
			severity: 'error',
			from: { path: '^src/lib/server/' },
			to: {
				path: [
					'^src/lib/components/',
					'^src/lib/features/[^/]+/client/',
					'^src/lib/client/',
					'\\.svelte\\.ts$',
				],
			},
		},
		{
			name: 'contracts-are-shared',
			comment:
				'Contracts are imported by both sides, so they must not import server, client or component code.',
			severity: 'error',
			from: { path: '^src/lib/features/[^/]+/contracts/' },
			to: {
				path: [
					'^src/lib/server/',
					'^src/lib/features/[^/]+/client/',
					'^src/lib/client/',
					'^src/lib/components/',
					'\\.svelte\\.ts$',
				],
			},
		},
		{
			name: 'components-use-commands',
			comment:
				'Components call client commands, workflows or the asset store; never storage, crop or ID generation directly.',
			severity: 'error',
			from: { path: '^src/lib/components/' },
			to: { path: ['^src/lib/utils/storage/', '^src/lib/utils/crop/', '^src/lib/utils/id\\.ts$'] },
		},
		{
			name: 'only-loader-and-error-read-global-state',
			comment: 'Only Loader.svelte and Error.svelte read globalLoading/globalError (forms.md).',
			severity: 'error',
			from: {
				path: '^src/',
				pathNot: [
					'^src/lib/components/loader/Loader\\.svelte$',
					'^src/lib/components/error/Error\\.svelte$',
					'^src/lib/forms/',
				],
			},
			to: { path: '^src/lib/utils/states/(loading|error)\\.svelte\\.ts$' },
		},
		{
			name: 'openai-only-in-gateway',
			comment:
				'Server code reaches the AI provider only through AiGateway. The prompt builders in utils/ai may use OpenAI types and the zod format helper, but make no calls.',
			severity: 'error',
			from: { pathNot: ['^src/lib/server/ai/openai-gateway\\.ts$', '^src/lib/utils/ai/'] },
			to: { path: '(^|/)node_modules/openai/' },
		},
		{
			name: 'no-circular',
			severity: 'error',
			from: {},
			to: { circular: true },
		},
		{
			name: 'not-to-unresolvable',
			severity: 'error',
			from: {},
			// SvelteKit virtual modules ($app/*, $env/*) and generated ./$types.
			to: {
				couldNotResolve: true,
				pathNot: ['^\\$(app|env|service-worker)(/|$)', '(^|/)\\$types$'],
			},
		},
	],
	options: {
		doNotFollow: { path: 'node_modules' },
		exclude: { path: ['^src/lib/paraglide/', '\\.svelte-kit/'] },
		tsConfig: { fileName: '.svelte-kit/tsconfig.json' },
		tsPreCompilationDeps: true,
		enhancedResolveOptions: {
			exportsFields: ['exports'],
			conditionNames: ['import', 'require', 'node', 'default', 'types', 'svelte'],
			extensions: ['.ts', '.js', '.svelte', '.json'],
		},
	},
};
