<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { resolve } from '$app/paths';
	import { currentPath, languageLinks, localizedHref } from './header-navigation';
	import Breadcrumb from '#lib/components/breadcrumb/Breadcrumb.svelte';
	import { breadcrumbProps } from '#lib/components/breadcrumb/breadcrumb-props.ts';

	const path = $derived(currentPath(page.url));
	const onHome = $derived(path === '/');
	const onSettings = $derived(path === '/settings');
	const languages = $derived(languageLinks(page.url));
	const crumbs = $derived(breadcrumbProps(page.route.id, page.data));
</script>

<header class="header">
	<div class="bar">
		<a class="wordmark" href={resolve(localizedHref('/'))}>{m.tusch()}</a>

		<nav class="wide-only" aria-label={m.mainNavigation()}>
			<ul class="nav-list">
				<li>
					<a href={resolve(localizedHref('/'))} aria-current={onHome ? 'page' : undefined}>
						{m.comics()}
					</a>
				</li>
				<li>
					<a
						href={resolve(localizedHref('/settings'))}
						aria-current={onSettings ? 'page' : undefined}
					>
						{m.settings()}
					</a>
				</li>
			</ul>
		</nav>

		{#if onHome}
			<a class="create wide-only" href={resolve(localizedHref('/comic/create'))}>
				{m.createNewComic()}
			</a>
		{/if}

		<nav class="wide-only" aria-label={m.languageNavigation()}>
			<ul class="nav-list">
				{#each languages as language (language.locale)}
					<li>
						<!--
							A full load, not a client navigation: the messages read the locale from
							the URL once per document, so client navigation would keep the old language.
						-->
						<!-- The visible abbreviation stays part of the name (WCAG 2.5.3): "EN English". -->
						<a
							href={resolve(language.href)}
							aria-current={language.current ? 'true' : undefined}
							data-sveltekit-reload
						>
							<abbr lang={language.lang}>{language.abbreviation}</abbr>
							<span class="visually-hidden">{language.name()}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="icon-links narrow-only">
			<a
				class="icon-link"
				href={resolve(localizedHref('/comic/create'))}
				aria-label={m.createNewComic()}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M12 5v14M5 12h14" />
				</svg>
			</a>
			<a class="icon-link" href={resolve(localizedHref('/settings'))} aria-label={m.settings()}>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
					<circle cx="16" cy="7" r="2" />
					<circle cx="8" cy="17" r="2" />
				</svg>
			</a>
		</div>

		{#if crumbs}
			<div class="crumbs">
				<Breadcrumb {...crumbs} />
			</div>
		{/if}
	</div>
</header>

<style>
	.header {
		background: var(--color-surface);
		border-block-end: var(--border-width) solid var(--color-border);
	}

	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2) var(--space-3);
		max-inline-size: var(--width-content);
		margin-inline: auto;
		padding: var(--space-2) var(--space-3);
	}

	.wordmark {
		font-size: var(--font-size-h3);
		font-weight: 700;
		color: var(--color-text);
		text-decoration: none;
	}

	/* A second row under the wordmark at every width; the header's flex row wraps after it. */
	.crumbs {
		flex: 1 1 100%;
		min-inline-size: 0;
	}

	.nav-list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.nav-list a[aria-current] {
		font-weight: 700;
	}

	.create {
		font-weight: 700;
	}

	.icon-links {
		display: flex;
		gap: var(--space-2);
	}

	.icon-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-inline-size: var(--control-min-size);
		min-block-size: var(--control-min-size);
		color: var(--color-text);
		border: var(--border-width) solid var(--color-control-border);
		border-radius: var(--radius);
	}

	.icon-link svg {
		inline-size: var(--icon-size);
		block-size: var(--icon-size);
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* Below 48em the navigation doesn't fit: the two icon links stand in for it. */
	.wide-only {
		display: none;
	}

	@media (min-width: 48em) {
		.wide-only {
			display: flex;
		}

		.narrow-only {
			display: none;
		}

		.bar {
			padding-inline: var(--space-5);
		}
	}
</style>
