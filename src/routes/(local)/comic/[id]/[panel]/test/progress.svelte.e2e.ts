import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { holdRequest } from '../../../../../../tests/e2e/holdRequest';
import { activate } from '../../../../../../tests/e2e/keyboard';
import { PanelPage } from './utils/panelPage';

test(
	'the loader names the panel image action with an indeterminate bar',
	{ tag: ['@REQ-041'] },
	async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();
		const release = await holdRequest(page, /\?\/create-panel-image/);

		await activate(page, panelPage.replaceImageButton);

		await expect(page.getByText(m.loadingCreatePanelImage())).toBeVisible();
		const bar = page.getByRole('progressbar');
		await expect(bar).toBeVisible();
		await expect(bar).not.toHaveAttribute('value');
		await expect(bar).toHaveAccessibleName(m.loadingCreatePanelImage());

		release();
		await expect(panelPage.newImage).toBeVisible();
		await expect(bar).toBeHidden();
	},
);
