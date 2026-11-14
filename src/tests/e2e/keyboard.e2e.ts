import { m } from '$lib/paraglide/messages';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { contrastRatio } from './contrast';
import { EXAMPLE_COMPLETE as EXAMPLE } from './examples';
import { gotoHydrated } from './gotoHydrated';
import { activate, chooseOption, focusableControls, tabTo, typeInto } from './keyboard';
import { VIEWS } from './views';

/** The visible links, buttons and form controls of the current view, in document order. */
async function visibleControls(page: Page): Promise<Locator[]> {
	await page.waitForLoadState('networkidle');
	return focusableControls(page).locator('visible=true').all();
}

/** What a focus indicator would change: outline and box-shadow. */
function indicator(control: Locator) {
	return control.evaluate((el) => {
		const style = getComputedStyle(el);
		return {
			outline: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
			outlineVisible: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
			boxShadow: style.boxShadow,
		};
	});
}

test.describe('keyboard: every control is reachable with Tab', { tag: '@REQ-037' }, () => {
	for (const [name, url] of Object.entries(VIEWS)) {
		test(name, async ({ page }) => {
			await gotoHydrated(page, url);
			const controls = await visibleControls(page);

			// Starting at the top of the page, Tab visits each control in document order.
			await page.locator('body').evaluate(() => (document.activeElement as HTMLElement)?.blur());
			for (const control of controls) {
				await page.keyboard.press('Tab');
				await expect(control).toBeFocused();
			}
		});
	}
});

test.describe('keyboard: buttons activate with Enter and Space', { tag: '@REQ-037' }, () => {
	test('creates a comic with Enter', async ({ page }) => {
		await gotoHydrated(page, VIEWS.create);

		await typeInto(page, page.getByRole('textbox', { name: m.url() }), 'https://example.com/a');
		await activate(page, page.getByRole('button', { name: m.submit() }), 'Enter');

		await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
	});

	test('adds a caption with Enter', async ({ page }) => {
		await gotoHydrated(page, VIEWS.panel);
		const captions = page.getByRole('list', { name: m.captions() }).getByRole('listitem');
		const before = await captions.count();

		await typeInto(page, page.getByRole('textbox', { name: m.newCaption() }), 'KEYBOARD CAPTION');
		await activate(page, page.getByRole('button', { name: m.addCaption() }), 'Enter');

		await expect(captions).toHaveCount(before + 1);
		await expect(captions.last()).toContainText('KEYBOARD CAPTION');
	});

	test('deletes a panel with Space', async ({ page }) => {
		await gotoHydrated(page, VIEWS.comic);
		const items = page.locator('ul[aria-labelledby="panels"] > li');
		await expect(items).toHaveCount(EXAMPLE.panels.length);

		await activate(page, page.getByRole('button', { name: m.deletePanel({ number: 3 }) }), 'Space');

		await expect(items).toHaveCount(EXAMPLE.panels.length - 1);
	});
});

test('keyboard: a select changes value by typing', { tag: '@REQ-037' }, async ({ page }) => {
	// The comic style select is the only one with several options (the mock
	// gateway lists a single model per kind).
	await gotoHydrated(page, VIEWS.create);
	const select = page.getByRole('combobox', { name: m.comicStyles() });
	await tabTo(page, select);
	const options = await select.getByRole('option').allTextContents();
	expect(options.length).toBeGreaterThan(2);
	await expect(select).toHaveValue(options[0]);

	// Type-ahead only: ArrowDown on a closed select opens the menu on macOS but
	// moves to the next option on Linux, so arrow keys can't be asserted portably.
	await chooseOption(page, select, options[2]);
	await expect(select).toHaveValue(options[2]);

	// Settings: the model select is reachable and operable too.
	await gotoHydrated(page, VIEWS.settings);
	const model = page.getByRole('combobox', { name: m.selectTextModel() });
	await chooseOption(page, model, 'gpt-6-luna');
	await expect(model).toHaveValue('gpt-6-luna');
});

test.describe('keyboard: the focus outline uses the accent colour', { tag: '@REQ-038' }, () => {
	for (const colorScheme of ['light', 'dark'] as const) {
		test.describe(colorScheme, () => {
			test.use({ colorScheme });
			test('accent outline with at least 3:1 contrast', async ({ page }) => {
				await gotoHydrated(page, VIEWS.create);
				const [control] = await visibleControls(page);
				await tabTo(page, control);

				// Resolve --color-focus through a probe so any colour syntax compares as rgb().
				const { token, accent, outline, background } = await control.evaluate((el) => {
					const token = getComputedStyle(document.documentElement).getPropertyValue(
						'--color-focus',
					);
					const probe = document.createElement('span');
					probe.style.color = 'var(--color-focus)';
					document.body.append(probe);
					const accent = getComputedStyle(probe).color;
					probe.remove();
					return {
						token: token.trim(),
						accent,
						outline: getComputedStyle(el).outlineColor,
						background: getComputedStyle(document.documentElement).backgroundColor,
					};
				});
				expect(token).not.toBe('');
				expect(outline).toBe(accent);
				expect(contrastRatio(accent, background)).toBeGreaterThanOrEqual(3);
			});
		});
	}
});

test.describe('keyboard: the focused control shows a focus indicator', { tag: '@REQ-038' }, () => {
	for (const [name, url] of Object.entries(VIEWS)) {
		test(name, async ({ page }) => {
			await gotoHydrated(page, url);
			const controls = await visibleControls(page);
			await page.locator('body').evaluate(() => (document.activeElement as HTMLElement)?.blur());

			const missing: string[] = [];
			for (const control of controls) {
				const before = await indicator(control);
				await page.keyboard.press('Tab');
				await expect(control).toBeFocused();
				const after = await indicator(control);

				const changed = after.outline !== before.outline || after.boxShadow !== before.boxShadow;
				const visible = after.outlineVisible || after.boxShadow !== 'none';
				if (!changed || !visible) {
					missing.push(await control.evaluate((el) => el.outerHTML.slice(0, 80)));
				}
			}
			expect(missing).toEqual([]);
		});
	}
});
