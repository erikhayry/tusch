import type { Path } from '$app/types';
import { m } from '#lib/paraglide/messages.js';
import {
	deLocalizeHref,
	getLocaleForUrl,
	locales,
	localizeHref,
	type Locale,
} from '#lib/paraglide/runtime.js';

/** The part of `page.url` the header reads. */
type PageUrl = Pick<URL, 'pathname' | 'href'>;

/**
 * `target` in the given locale, or the current one when none is given. The caller passes it
 * through `resolve()` in the template, as every other link does.
 */
export function localizedHref(target: string, locale?: Locale): Path {
	return localizeHref(target, locale ? { locale } : undefined) as Path;
}

/** The page path without its locale prefix, so one page is recognised in either language. */
export function currentPath(url: PageUrl): string {
	return deLocalizeHref(url.pathname);
}

const LANGUAGE_NAMES: Record<Locale, () => string> = {
	en: () => m.languageEnglish(),
	'sv-se': () => m.languageSwedish(),
};

/**
 * One entry per locale in paraglide's `locales`. `lang` and the visible abbreviation both come
 * from the locale's language part ("sv-se" → "sv", "SV").
 */
export function languageLinks(url: PageUrl) {
	const path = currentPath(url);
	const currentLocale = getLocaleForUrl(url.href);

	return locales.map((locale) => {
		const language = locale.split('-')[0];

		return {
			locale,
			lang: language,
			abbreviation: language.toUpperCase(),
			name: LANGUAGE_NAMES[locale],
			href: localizedHref(path, locale),
			current: locale === currentLocale,
		};
	});
}
