import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
	createComic,
	deletePanel,
	generatePanelImage,
	storedComic,
} from '../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../tests/e2e/keyboard';
import { storedFiles } from '../../../../../tests/e2e/storage';
import { KEY_COOKIE_NAME } from '#lib/utils/cookies.ts';
import { PanelPage } from '../[panel]/test/utils/panelPage';

type Asset = { src: string; width: number; height: number };
type Crop = {
	id: string;
	head: Asset;
	full: Asset;
	previous?: { head: Asset; full: Asset };
};

/**
 * Names the developer adds to both locale files (issue #219):
 * `fixCharacterCrop` and `undoCharacterCropFix`, both taking `{ name, number, title }`.
 * Until they exist the fallback keeps the failure "button not found".
 */
function cropMessage(key: 'fixCharacterCrop' | 'undoCharacterCropFix', params: Params): string {
	const message = (m as unknown as Record<string, ((params: Params) => string) | undefined>)[key];
	return message?.(params) ?? `${key}: ${params.name} in panel ${params.number}`;
}

type Params = { name: string; number: number; title: string };

type Setup = {
	page: Page;
	comicId: string;
	panelId: string;
	characterId: string;
	params: Params;
};

/** Read the character's crops of one panel straight from localStorage; keeps `previous`. */
function storedCrops(page: Page, { comicId, panelId, characterId }: Setup): Promise<Crop[]> {
	return page.evaluate(
		(ids) => {
			const { comics } = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
			const comic = comics.find((c: { id: string }) => c.id === ids.comicId);
			const character = comic?.characters.find((c: { id: string }) => c.id === ids.characterId);
			return (character?.images ?? []).filter(
				(image: { panelId: string }) => image.panelId === ids.panelId,
			);
		},
		{ comicId, panelId, characterId },
	);
}

/** The crop the gallery shows for the panel: the most recent one (after a replaced panel image there are two). */
async function onlyCrop(setup: Setup): Promise<Crop> {
	const crop = (await storedCrops(setup.page, setup)).at(-1);
	if (!crop) {
		throw new Error('expected a stored crop for the panel');
	}
	return crop;
}

const filesOf = (crop: Crop | { head: Asset; full: Asset }) => [crop.head.src, crop.full.src];

/** A user-created comic whose first panel has a generated image, opened on the comic page. */
async function setUp(page: Page): Promise<Setup> {
	const comicId = await createComic(page);
	const { panels, characters } = await storedComic(page, comicId);
	const panel = panels[0];
	const character = characters[0];
	if (!panel || !character) {
		throw new Error('created comic needs a panel and a character');
	}
	await generatePanelImage(page, comicId, panel.id);
	await gotoHydrated(page, `/comic/${comicId}`);
	return {
		page,
		comicId,
		panelId: panel.id,
		characterId: character.id,
		params: { name: character.name, number: 1, title: panel.editorialTitle },
	};
}

function characterSection({ page, params }: Setup): Locator {
	return page
		.locator('ul[aria-labelledby="characters"] > li')
		.filter({ has: page.getByRole('heading', { name: params.name, exact: true }) });
}

/** The summary of the head crop in the gallery; exact, as the buttons' names contain it. */
const headControl = (setup: Setup) =>
	characterSection(setup).getByLabel(m.characterHeadAlt(setup.params), { exact: true });
const fixButton = (setup: Setup) =>
	characterSection(setup).getByRole('button', {
		name: cropMessage('fixCharacterCrop', setup.params),
	});
const undoButton = (setup: Setup) =>
	characterSection(setup).getByRole('button', {
		name: cropMessage('undoCharacterCropFix', setup.params),
	});

/** Expand the crop's `<details>` with the keyboard, unless it is open already. */
async function expand(setup: Setup) {
	const details = characterSection(setup).locator('details');
	if (await details.evaluate((el: HTMLDetailsElement) => el.open)) {
		return;
	}
	await activate(setup.page, headControl(setup));
	await expect(details).toHaveJSProperty('open', true);
}

/** Fail fast and clearly when the button is missing, instead of tabbing 80 times. */
async function activateVisible(setup: Setup, button: Locator) {
	await expect(button).toBeVisible();
	await activate(setup.page, button);
}

/** Fix the crop and wait until the stored head crop is a new file. */
async function fixCrop(setup: Setup): Promise<Crop> {
	const before = await onlyCrop(setup);
	await expand(setup);
	await activateVisible(setup, fixButton(setup));
	await expect.poll(async () => (await onlyCrop(setup)).head.src).not.toBe(before.head.src);
	return onlyCrop(setup);
}

async function undoFix(setup: Setup) {
	await expand(setup);
	await activateVisible(setup, undoButton(setup));
	await expect(undoButton(setup)).toHaveCount(0);
}

async function expectFilesGone(page: Page, names: string[]) {
	await expect
		.poll(async () => {
			const files = await storedFiles(page);
			return names.filter((name) => files.includes(name));
		})
		.toEqual([]);
}

test.describe('fix a character crop', () => {
	test(
		'offers "Fix crop" inside the expanded head crop of a created comic',
		{ tag: '@REQ-219-1' },
		async ({ page }) => {
			const setup = await setUp(page);
			await expect(headControl(setup)).toHaveCount(1);
			await expect(fixButton(setup)).toBeHidden();

			await expand(setup);

			await expect(fixButton(setup)).toBeVisible();
			await expect(undoButton(setup)).toHaveCount(0);
		},
	);

	test(
		'replaces the head and full-body crops with new files and sizes',
		{ tag: ['@REQ-219-1', '@REQ-101-1'] },
		async ({ page }) => {
			const setup = await setUp(page);
			const before = await onlyCrop(setup);

			const after = await fixCrop(setup);

			expect(after.id).toBe(before.id);
			expect(after.head.src).not.toBe(before.head.src);
			expect(after.full.src).not.toBe(before.full.src);
			expect([after.head.width, after.head.height]).not.toEqual([
				before.head.width,
				before.head.height,
			]);
			expect([after.full.width, after.full.height]).not.toEqual([
				before.full.width,
				before.full.height,
			]);
			await expect(headControl(setup)).toHaveCount(1);
			expect(await storedFiles(page)).toEqual(expect.arrayContaining(filesOf(after)));
		},
	);

	test(
		'shows the fixed head crop next to the dialogue on the panel page',
		{ tag: ['@REQ-219-1', '@REQ-018'] },
		async ({ page }) => {
			await PanelPage.recordImageFileNames(page);
			const setup = await setUp(page);
			const fixed = await fixCrop(setup);

			await gotoHydrated(page, `/comic/${setup.comicId}/${setup.panelId}`);

			const panelPage = new PanelPage(page);
			await expect(panelPage.dialogueCharacterImage.first()).toBeVisible();
			expect(await panelPage.dialogueCharacterImageFileNames()).toContain(fixed.head.src);
		},
	);
});

test.describe('undo a crop fix', () => {
	test(
		'survives a reload and puts the previous crops back',
		{ tag: '@REQ-219-2' },
		async ({ page }) => {
			const setup = await setUp(page);
			const original = await onlyCrop(setup);
			await fixCrop(setup);

			await gotoHydrated(page, `/comic/${setup.comicId}`);
			await expand(setup);
			await expect(undoButton(setup)).toBeVisible();
			await activate(page, undoButton(setup));

			await expect(undoButton(setup)).toHaveCount(0);
			const restored = await onlyCrop(setup);
			expect(restored.head).toEqual(original.head);
			expect(restored.full).toEqual(original.full);
			expect(restored.previous).toBeUndefined();
			await expect(headControl(setup)).toHaveCount(1);
		},
	);

	test('moves focus to the Fix crop button after undo', { tag: '@REQ-219-2' }, async ({ page }) => {
		const setup = await setUp(page);
		await fixCrop(setup);

		await undoFix(setup);

		await expect(fixButton(setup)).toBeFocused();
	});

	test('goes back exactly one step after two fixes', { tag: '@REQ-219-2' }, async ({ page }) => {
		const setup = await setUp(page);
		const first = await fixCrop(setup);
		const second = await fixCrop(setup);
		expect(second.head.src).not.toBe(first.head.src);

		await undoFix(setup);

		const restored = await onlyCrop(setup);
		expect(restored.head).toEqual(first.head);
		expect(restored.full).toEqual(first.full);
		expect(restored.previous).toBeUndefined();
		await expect(undoButton(setup)).toHaveCount(0);
	});
});

test.describe('crop fixes leave no stray files', () => {
	test(
		'undo removes the fixed crop files',
		{ tag: ['@REQ-219-3', '@REQ-025'] },
		async ({ page }) => {
			const setup = await setUp(page);
			const original = await onlyCrop(setup);
			const fixed = await fixCrop(setup);
			expect(await storedFiles(page)).toEqual(expect.arrayContaining(filesOf(fixed)));

			await undoFix(setup);

			await expectFilesGone(page, filesOf(fixed));
			expect(await storedFiles(page)).toEqual(expect.arrayContaining(filesOf(original)));
		},
	);

	test(
		'a second fix removes the files of the version it replaces as previous',
		{ tag: ['@REQ-219-3', '@REQ-025'] },
		async ({ page }) => {
			const setup = await setUp(page);
			const original = await onlyCrop(setup);
			const first = await fixCrop(setup);

			const second = await fixCrop(setup);

			await expectFilesGone(page, filesOf(original));
			const files = await storedFiles(page);
			for (const file of [...filesOf(first), ...filesOf(second)]) {
				expect(files).toContain(file);
			}
		},
	);

	test(
		'deleting the panel removes the current and the previous crop files',
		{ tag: ['@REQ-219-3', '@REQ-025'] },
		async ({ page }) => {
			const setup = await setUp(page);
			const fixed = await fixCrop(setup);
			if (!fixed.previous) {
				throw new Error('a fixed crop must keep its previous version');
			}
			const all = [...filesOf(fixed), ...filesOf(fixed.previous)];
			expect(await storedFiles(page)).toEqual(expect.arrayContaining(all));

			await deletePanel(page, setup.comicId, 1);

			await expectFilesGone(page, all);
		},
	);

	test(
		'restoring the panel image removes the dropped crop files, current and previous',
		{ tag: ['@REQ-219-3', '@REQ-049', '@REQ-025'] },
		async ({ page }) => {
			const setup = await setUp(page);
			// Replace the panel image, so the gallery crop now comes from the new image.
			await gotoHydrated(page, `/comic/${setup.comicId}/${setup.panelId}`);
			const panelPage = new PanelPage(page);
			await activate(page, panelPage.replaceImageButton);
			await expect(panelPage.restoreImageButton).toBeVisible();
			await gotoHydrated(page, `/comic/${setup.comicId}`);
			const fixed = await fixCrop(setup);
			if (!fixed.previous) {
				throw new Error('a fixed crop must keep its previous version');
			}
			const dropped = [...filesOf(fixed), ...filesOf(fixed.previous)];

			await gotoHydrated(page, `/comic/${setup.comicId}/${setup.panelId}`);
			await activate(page, panelPage.restoreImageButton);
			await expect(panelPage.restoreImageButton).toBeHidden();

			await expectFilesGone(page, dropped);
			expect((await storedCrops(page, setup)).map(({ id }) => id)).not.toContain(fixed.id);
		},
	);
});

test.describe('a failed crop fix', () => {
	/** Fail the AI call the way a user's bad key does: the marker sits in the API key. */
	async function failWith(setup: Setup, marker: string) {
		await setup.page
			.context()
			.addCookies([{ name: KEY_COOKIE_NAME, value: marker, url: 'http://localhost:4173' }]);
		await gotoHydrated(setup.page, `/comic/${setup.comicId}`);
		const before = await onlyCrop(setup);
		await expand(setup);
		await activateVisible(setup, fixButton(setup));
		return before;
	}

	for (const [kind, message] of [
		['rate-limit', 'AI provider rate limit reached, try again shortly'],
		['auth', 'API key is invalid or rejected'],
		['upstream', 'AI provider request failed (HTTP 500): boom'],
	] as const) {
		test(`shows the ${kind} error and keeps the crops`, { tag: '@REQ-219-4' }, async ({ page }) => {
			const setup = await setUp(page);

			const before = await failWith(setup, `mock-error:${kind}`);

			await expect(page.getByTestId('error-test-id')).toContainText(message);
			expect(await onlyCrop(setup)).toEqual(before);
			await expect(undoButton(setup)).toHaveCount(0);
		});
	}

	test(
		'shows an error and keeps the crops when the boxes are outside the image',
		{ tag: '@REQ-219-4' },
		async ({ page }) => {
			const setup = await setUp(page);

			const before = await failWith(setup, 'mock-error:invalid-crop');

			await expect(page.getByTestId('error-test-id')).toBeVisible();
			await expect(page.getByTestId('error-test-id')).not.toContainText('{');
			expect(await onlyCrop(setup)).toEqual(before);
			await expect(undoButton(setup)).toHaveCount(0);
		},
	);
});
