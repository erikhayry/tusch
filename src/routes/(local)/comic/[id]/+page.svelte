<script lang="ts">
	import { resolve } from '$app/paths';
	import Comic from '#lib/components/comic/Comic.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import { comicCountsLine } from '#lib/features/comics/client/comic-selectors.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Data } from './+page';

	let { data }: { data: Data } = $props();

	const title = $derived(data.comic.title.trim() || m.untitledComic());
</script>

<!-- The top row places Back before the <h1> and View comic after it, so the page owns its <h1>. -->
<Page {title} showTitle={false}>
	{#if data.comic}
		<div class="top">
			<a class="action" href={resolve('')}>{m.back()}</a>
			<div class="heading">
				<h1>{title}</h1>
				<p class="meta">{comicCountsLine(data.comic)}</p>
			</div>
			<a class="action" href={resolve(`comic/${data.comic.id}/view`)}>{m.viewComic()}</a>
		</div>
		<Comic comic={data.comic} />
	{/if}
</Page>

<style>
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: var(--space-3) var(--space-4);
		margin-block-end: var(--space-4);
	}

	.heading {
		flex: 1 1 var(--card-min-width);
		min-inline-size: 0;
	}

	.heading h1 {
		margin-block: 0 var(--space-1);
		overflow-wrap: anywhere;
	}

	.meta {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}

	.action {
		display: inline-flex;
		align-items: center;
		min-block-size: var(--control-min-size);
		padding-inline: var(--space-3);
		border: var(--border-width) solid var(--color-control-border);
		border-radius: var(--radius);
		color: var(--color-link);
		text-decoration: none;
	}
</style>
