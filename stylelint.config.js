// Mechanical rules from docs/rules/styling.md. Judgement checks are the
// css-reviewer agent's job.
const COLOR_FUNCTIONS = /\b(rgb|hsl|hwb|lab|lch|oklab|oklch|color)a?\(/i;
const HEX_COLOR = /#[0-9a-f]{3,8}\b/i;
// Any percentage except 100%.
const PERCENTAGE = /(?<![\w.])(?!100%)\d*\.?\d+%/;

// Absolute and font/viewport-relative lengths; `s`, `ms` and `deg` are not lengths.
const LENGTH_UNITS = [
	'px',
	'rem',
	'em',
	'ex',
	'ch',
	'lh',
	'rlh',
	'vw',
	'vh',
	'vmin',
	'vmax',
	'svw',
	'svh',
	'lvw',
	'lvh',
	'dvw',
	'dvh',
	'cm',
	'mm',
	'in',
	'pt',
	'pc',
	'Q',
];

/** @param {{ ignoreCustomProperties: boolean }} options */
const tokenRules = ({ ignoreCustomProperties }) => {
	// The token block (`:root` in app.css, including its dark override) is the
	// only place raw values may live, so it may declare custom properties.
	const property = ignoreCustomProperties ? '/^(?!--)/' : '/.*/';
	return {
		'declaration-property-value-disallowed-list': {
			[property]: [HEX_COLOR, COLOR_FUNCTIONS, PERCENTAGE],
		},
		'unit-disallowed-list': [
			LENGTH_UNITS,
			{
				// Breakpoints can't use custom properties (see app.css).
				ignoreMediaFeatureNames: { em: ['min-width'] },
				...(ignoreCustomProperties && {
					ignoreProperties: Object.fromEntries(LENGTH_UNITS.map((u) => [u, ['/^--/']])),
				}),
			},
		],
		// No named colours, except in custom property values in the token block.
		'color-named': ['never', { ignoreProperties: ignoreCustomProperties ? ['/^--/'] : [] }],
	};
};

/** @type {import('stylelint').Config} */
export default {
	plugins: ['./stylelint-plugins/outline-focus-visible.mjs'],
	rules: {
		...tokenRules({ ignoreCustomProperties: false }),
		'tusch/outline-focus-visible': true,
		// Mobile first: only min-width, and only the breakpoint documented in app.css.
		'media-feature-name-disallowed-list': ['/^max-/', '/^(min-|max-)?device-/'],
		'media-feature-range-notation': 'prefix',
		'media-feature-name-value-allowed-list': { 'min-width': ['48em'] },
	},
	overrides: [
		{
			files: ['**/*.svelte'],
			customSyntax: 'postcss-html',
		},
		{
			files: ['src/app.css'],
			// Raw values are exempt only as custom properties, and only in `:root`.
			rules: {
				...tokenRules({ ignoreCustomProperties: true }),
				'tusch/custom-property-in-root': true,
			},
		},
	],
};
