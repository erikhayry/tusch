<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Path } from '$app/types';
	import { localizedHref } from '#lib/components/header/header-navigation.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { BreadcrumbProps } from './breadcrumb-props.ts';

	type Crumb = { label: string; href?: Path; current?: true };

	let { comicId, comicTitle, panelNumber }: BreadcrumbProps = $props();

	const title = $derived(comicTitle.trim() || m.untitledComic());

	const items = $derived.by<Crumb[]>(() => {
		const comics: Crumb = { label: m.comics(), href: localizedHref('/') };
		if (panelNumber === undefined) {
			return [comics, { label: title, current: true }];
		}
		return [
			comics,
			{ label: title, href: localizedHref(`/comic/${comicId}`) },
			{ label: m.panel({ number: panelNumber }), current: true },
		];
	});
</script>

<nav class="breadcrumb" aria-label={m.breadcrumb()}>
	<ol>
		{#each items as item, index (index)}
			<li class="crumb" aria-current={item.current ? 'page' : undefined}>
				{#if item.href}
					<a class="label" href={resolve(item.href)}>{item.label}</a>
				{:else}
					<span class="label">{item.label}</span>
				{/if}
				{#if !item.current}
					<span class="separator" aria-hidden="true">/</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb {
		min-inline-size: 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}

	ol {
		display: flex;
		flex-wrap: nowrap;
		align-items: baseline;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* One line: a long title shrinks and ends in an ellipsis; the full text stays in the DOM. */
	.crumb {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.crumb[aria-current='page'] {
		color: var(--color-text);
		font-weight: 700;
	}

	.label {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	a.label {
		color: var(--color-link);
	}

	.separator {
		flex: none;
	}
</style>
