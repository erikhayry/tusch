<script lang="ts">
	import { resolve } from '$app/paths';
	import { comicFileName } from '#lib/client/export/comic-html.ts';
	import { exportComicData } from '#lib/client/export/export-comic-data.ts';
	import Comic from '#lib/components/comic/Comic.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import { comicCountsLine } from '#lib/features/comics/client/comic-selectors.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Data } from './+page';

	let { data }: { data: Data } = $props();

	const title = $derived(data.comic.title.trim() || m.untitledComic());
	const exportFileName = $derived(comicFileName(data.comic.title, 'json'));

	// The file is built (its images are read first) on click, so the link stays a link
	// with `download` and no form or button, like "Download comic" on the viewer.
	function exportComic(event: MouseEvent) {
		event.preventDefault();
		void exportComicData(data.comic);
	}
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
			<div class="actions">
				<a class="action" href={resolve(`comic/${data.comic.id}/view`)}>{m.viewComic()}</a>
				<a
					class="action"
					href={resolve(`comic/${data.comic.id}`)}
					download={exportFileName}
					onclick={exportComic}>{m.exportComicData()}</a
				>
			</div>
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

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
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
