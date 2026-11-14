import { expect, test } from '@playwright/test';
import { createComic } from '../../../../../../tests/e2e/createdComic';
import { UntitledPanelPage } from './utils/untitledPanelPage';

test(
	'panel navigation link has an accessible name when the panel title is empty',
	{ tag: ['@REQ-190-1', '@REQ-035'] },
	async ({ page }) => {
		const comicId = await createComic(page);
		const panelPage = new UntitledPanelPage(page, comicId);
		await panelPage.open();
		await panelPage.addUntitledPanelBeforeFirst();

		await expect(panelPage.panels).toHaveCount(await panelPage.storedPanelCount());

		// The new, untitled panel is first; its link falls back to the panel number.
		await expect(panelPage.firstPanelLink).toBeVisible();

		await panelPage.expectNoAxeViolations();
	},
);
