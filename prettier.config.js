/** @type {import("prettier").Config} */
const config = {
	useTabs: true,
	tabWidth: 2,
	singleQuote: true,
	trailingComma: 'all',
	printWidth: 100,
	plugins: ['prettier-plugin-svelte'],
	svelteSortOrder: 'options-scripts-markup-styles',
	svelteIndentScriptAndStyle: true,
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }]
};

export default config;
