import type { Page } from '@playwright/test';

/** What a reader sees: the first opaque background from `<body>` up, and the body's text colour. */
export function pageColours(page: Page) {
	return page.evaluate(() => {
		let background = 'rgb(255, 255, 255)';
		for (const element of [document.body, document.documentElement]) {
			const { backgroundColor } = getComputedStyle(element);
			if (!/rgba\(.*,\s*0\)$/.test(backgroundColor) && backgroundColor !== 'transparent') {
				background = backgroundColor;
				break;
			}
		}
		return {
			background,
			text: getComputedStyle(document.body).color,
			colorScheme: getComputedStyle(document.documentElement).colorScheme,
		};
	});
}
