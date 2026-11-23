import { m } from '#lib/paraglide/messages.js';
import { expect, type Locator, type Page } from '@playwright/test';
import { storedComic } from '../../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../../tests/e2e/keyboard';

/** The panel list (a row of cards) on the page of a user-made comic. */
export class PanelCardsPage {
	readonly page: Page;
	readonly comicId: string;
	readonly list: Locator;
	readonly items: Locator;
	/** Every link and button in the list, in DOM order. */
	readonly controls: Locator;

	constructor(page: Page, comicId: string) {
		this.page = page;
		this.comicId = comicId;
		this.list = page.getByRole('list', { name: m.panels() });
		this.items = this.list.getByRole('listitem');
		this.controls = this.list.locator('a, button');
	}

	/** Open the page of the panel at `index` (negative counts from the end). */
	async open(index = 0) {
		const panel = (await storedComic(this.page, this.comicId)).panels.at(index);
		if (!panel) {
			throw new Error(`comic has no panel at ${index}`);
		}
		await gotoHydrated(this.page, `/comic/${this.comicId}/${panel.id}`);
	}

	/** The title a card link is named by: the stored title, or "Panel N" when it is empty. */
	async cardTitles() {
		const { panels } = await storedComic(this.page, this.comicId);
		return panels.map((panel, index) => panel.editorialTitle || m.panel({ number: index + 1 }));
	}

	/** The card's single link; the title is its accessible name. */
	link(index: number) {
		return this.items.nth(index).getByRole('link');
	}

	/** Insert panels after the last one until the list holds `count` cards (real users' buttons). */
	async addPanelsUntil(count: number) {
		for (let current = await this.items.count(); current < count; current++) {
			await activate(
				this.page,
				this.page.getByRole('button', { name: m.addPanelAfter({ number: current }), exact: true }),
			);
			await expect(this.page.getByRole('progressbar')).toBeHidden();
			await expect(this.items).toHaveCount(current + 1);
		}
	}

	scrollSize() {
		return this.list.evaluate((el) => ({
			scrollWidth: el.scrollWidth,
			clientWidth: el.clientWidth,
		}));
	}

	/** Distance between the highest and lowest card top; 0 when all cards share one row. */
	async rowSpread() {
		const tops = await this.items.evaluateAll((els) =>
			els.map((el) => el.getBoundingClientRect().top),
		);
		return Math.max(...tops) - Math.min(...tops);
	}

	/** Whether `target` lies inside the list's visible box, horizontally (1px tolerance). */
	isInsideListBox(target: Locator) {
		return target.evaluate((el) => {
			const box = el.closest('ol')?.getBoundingClientRect();
			const rect = el.getBoundingClientRect();
			return !!box && rect.left >= box.left - 1 && rect.right <= box.right + 1;
		});
	}
}
