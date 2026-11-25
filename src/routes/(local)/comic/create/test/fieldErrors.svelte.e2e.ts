import { m } from '#lib/paraglide/messages.js';
import { localizeHref } from '#lib/paraglide/runtime.js';
import { expect, test } from '@playwright/test';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { storedComics } from '../../../../../tests/e2e/storage';
import { CreatePage } from './utils/createPage';

const TOO_SHORT = 'too short';
const VALID_STORY = 'A lighthouse keeper finds a message in a bottle.';
// What the schema library says when a field has no message of ours (Zod's default copy).
const LIBRARY_DEFAULT = /too small|expected|invalid input/i;
const GENERIC_ENGLISH = /submitted values are invalid/i;

test(
	'marks a too short story invalid and describes why, in translated words',
	{ tag: '@REQ-201-1' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const before = (await storedComics(page)).length;
		const hintOnly = await createPage.storyInput.evaluate(
			(el) => (el.getAttribute('aria-describedby') ?? '').split(' ').length,
		);
		await createPage.pasteStory(TOO_SHORT);
		await createPage.submitToServer();

		await expect(createPage.storyInput).toHaveAttribute('aria-invalid', 'true');
		// The field points at one more element than before: its own error message.
		await expect
			.poll(() =>
				createPage.storyInput.evaluate(
					(el) => (el.getAttribute('aria-describedby') ?? '').split(' ').length,
				),
			)
			.toBeGreaterThan(hintOnly);
		await expect(createPage.storyInput).not.toHaveAccessibleDescription(LIBRARY_DEFAULT);
		await expect(page).toHaveURL(/\/comic\/create$/);
		expect((await storedComics(page)).length).toBe(before);
	},
);

test(
	'describes a too short story in Swedish, not with the generic English message',
	{ tag: ['@REQ-201-1', '@REQ-201-2'] },
	async ({ page }) => {
		await gotoHydrated(page, localizeHref('/comic/create', { locale: 'sv-se' }));
		const createPage = new CreatePage(page, 'sv-se');
		await createPage.pasteStory(TOO_SHORT);
		await createPage.submitToServer();

		await expect(createPage.storyInput).toHaveAttribute('aria-invalid', 'true');
		await expect(createPage.storyInput).not.toHaveAccessibleDescription(LIBRARY_DEFAULT);
		await expect(createPage.storyInput).not.toHaveAccessibleDescription(GENERIC_ENGLISH);
		await expect(createPage.error).not.toContainText(GENERIC_ENGLISH);
	},
);

test(
	'stops marking the story invalid once it is long enough',
	{ tag: '@REQ-201-3' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await createPage.pasteStory(TOO_SHORT);
		await createPage.submitToServer();
		await expect(createPage.storyInput).toHaveAttribute('aria-invalid', 'true');

		// A bad panel count keeps the request failing, so the form stays on screen.
		await createPage.pasteStory(VALID_STORY);
		await createPage.setPanelCount('0');
		await createPage.submit();

		await expect(createPage.error).toContainText(m.createComicPanelCountError());
		await expect(createPage.storyInput).not.toHaveAttribute('aria-invalid', 'true');
	},
);
