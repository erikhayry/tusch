import type { Page } from '@playwright/test';
import { m } from '#lib/paraglide/messages.js';
import type { Locale } from '#lib/paraglide/runtime.js';

/** The shared header (REQ-294), found by its landmarks since the layout has no other hook. */
export class HeaderPage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	get banner() {
		return this.page.getByRole('banner');
	}

	bannerLink(name: string) {
		return this.banner.getByRole('link', { name });
	}

	/** The wide-screen navigation; `locale` reads its name in that language. */
	mainNav(locale?: Locale) {
		return this.page.getByRole('navigation', { name: m.mainNavigation({}, { locale }) });
	}

	languageNav(locale?: Locale) {
		return this.page.getByRole('navigation', { name: m.languageNavigation({}, { locale }) });
	}
}
