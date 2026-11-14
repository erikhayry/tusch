import AxeBuilder from '@axe-core/playwright';
import { m } from '$lib/paraglide/messages';
import { expect, type Locator, type Page } from '@playwright/test';
import { storedComic } from '../../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../../tests/e2e/keyboard';

/** A user-made comic with an untitled panel added before the first one. */
export class UntitledPanelPage {
	readonly page: Page;
	readonly comicId: string;
	readonly panels: Locator;
	readonly firstPanelLink: Locator;
	readonly addPanelBeforeFirstButton: Locator;

	constructor(page: Page, comicId: string) {
		this.page = page;
		this.comicId = comicId;
		this.panels = page.getByRole('list', { name: m.panels() }).getByRole('listitem');
		this.firstPanelLink = this.panels.nth(0).getByRole('link', { name: m.panel({ number: 1 }) });
		this.addPanelBeforeFirstButton = page.getByRole('button', {
			name: m.addPanelBefore({ number: 1 }),
		});
	}

	async open() {
		const [firstPanel] = (await storedComic(this.page, this.comicId)).panels;
		await gotoHydrated(this.page, `/comic/${this.comicId}/${firstPanel.id}`);
	}

	/** The mock's "add panel" response has an empty editorialTitle, as a real comic can. */
	async addUntitledPanelBeforeFirst() {
		await activate(this.page, this.addPanelBeforeFirstButton);
		await expect(this.page.getByRole('progressbar')).toBeHidden();
		await expect
			.poll(async () =>
				(await storedComic(this.page, this.comicId)).panels.map((p) => p.editorialTitle),
			)
			.toContain('');
	}

	async storedPanelCount() {
		return (await storedComic(this.page, this.comicId)).panels.length;
	}

	async expectNoAxeViolations() {
		const { violations } = await new AxeBuilder({ page: this.page }).analyze();
		expect(
			violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((n) => n.target.join(' ')) })),
		).toEqual([]);
	}
}
