import { m } from '#lib/paraglide/messages.js';
import { expect, type Page } from '@playwright/test';
import { activate } from './keyboard';
import { generatingDialog, holdImageRequestsForever } from './generatingOverlay';
import { EXAMPLE_COMPLETE as EXAMPLE } from './examples';
import { gotoHydrated } from './gotoHydrated';
import { setImageFormat } from './imageFormat';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';
// The second panel has both variants, so "Generate new image" is the button that opens the dialog.
const GENERATING_PANEL = `/comic/${EXAMPLE.id}/${EXAMPLE.panels[1].id}`;
const FIRST_PANEL = `/comic/${EXAMPLE.id}/${EXAMPLE.panels[0].id}`;

/**
 * Every view of the app, keyed by its screenshot name. The screenshot and
 * accessibility tests both visit these; a new view goes here.
 */
export const VIEWS = {
	landing: '/',
	create: '/comic/create',
	comic: `/comic/${EXAMPLE.id}`,
	panel: FIRST_PANEL,
	'mobile-panel': FIRST_PANEL,
	// The same panel on a portrait-only comic: the Portrait/Landscape switch (REQ-279-1).
	'panel-single-format': FIRST_PANEL,
	view: `/comic/${EXAMPLE.id}/view`,
	raw: `/comic/${EXAMPLE.id}/raw`,
	'not-found': `/comic/${MISSING_ID}`,
	settings: '/settings',
	'panel-generating': GENERATING_PANEL,
	'mobile-panel-generating': GENERATING_PANEL,
} as const;

export type ViewName = keyof typeof VIEWS;

/** Views shown at the narrow width only; the desktop loop skips them. */
export const NARROW_VIEWS: readonly ViewName[] = ['mobile-panel', 'mobile-panel-generating'];

async function openGeneratingDialog(page: Page) {
	// Held open for good: the request never returns, so the dialog stays up for the capture.
	await holdImageRequestsForever(page);
	await activate(page, page.getByRole('button', { name: m.generateNewImage(), exact: true }));
	await expect(generatingDialog(page)).toBeVisible();
}

/**
 * What a view shows beyond its URL, run after the page has loaded and settled. A view
 * that needs an action (an open dialog) is listed here; plain views need nothing.
 */
/** The example comic becomes portrait-only through the UI, then its first panel is shown again. */
async function showPortraitOnlyPanel(page: Page) {
	await setImageFormat(page, EXAMPLE.id, 'portrait');
	await gotoHydrated(page, FIRST_PANEL);
	await page.waitForLoadState('networkidle');
}

export const VIEW_ACTIONS: Partial<Record<ViewName, (page: Page) => Promise<void>>> = {
	'panel-generating': openGeneratingDialog,
	'mobile-panel-generating': openGeneratingDialog,
	'panel-single-format': showPortraitOnlyPanel,
};
