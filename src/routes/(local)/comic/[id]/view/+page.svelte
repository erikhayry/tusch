<script lang="ts">
	import { resolve } from '$app/paths';
	import { comicFileName } from '#lib/client/export/comic-html.ts';
	import { downloadComicHtml } from '#lib/client/export/download-comic.ts';
	import PanelPicture from '#lib/components/image/PanelPicture.svelte';
	import PanelBoxes from '#lib/components/panelBoxes/PanelBoxes.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import Heading from '#lib/components/relativeHeading/Heading.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { localizedHref } from '#lib/components/header/header-navigation.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Data } from '../+page';

	let { data }: { data: Data } = $props();
	const title = $derived(data.comic.title.trim() || m.untitledComic());
	const fileName = $derived(comicFileName(data.comic.title));
	const countText = $derived(
		data.comic.panels.length === 1
			? m.panelCountOne()
			: m.panelCount({ count: data.comic.panels.length }),
	);
	const editUrl = $derived(resolve(`comic/${data.comic.id}`));
	const viewUrl = $derived(resolve(`comic/${data.comic.id}/view`));

	// The file is built (its images are read first) on click, so the link stays a link
	// with `download` and no form or button (REQ-87-3). Both "Download comic" links use it.
	function downloadComic(event: MouseEvent) {
		event.preventDefault();
		void downloadComicHtml(data.comic);
	}
</script>

<!-- `.reader` makes the whole document dark (app.css, REQ-044). -->
<div class="reader">
	<header class="reader-header">
		<div class="bar">
			<a class="link" href={editUrl} aria-label={m.backToEditing()}>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M19 12H5M11 6l-6 6 6 6" />
				</svg>
				<span class="label">{m.backToEditing()}</span>
			</a>
			<p class="title">{title}</p>
			<a
				class="link"
				href={viewUrl}
				download={fileName}
				aria-label={m.downloadComic()}
				onclick={downloadComic}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
				</svg>
				<span class="label">{m.downloadComic()}</span>
			</a>
		</div>
	</header>

	<Page {title} showTitle={false}>
		<!-- The title is an inverted caption over the cover, placed over a frame when there is no cover. -->
		<div class="cover">
			{#if data.comic.cover}
				<PanelPicture image={data.comic.cover} alt={data.comic.cover.alt} />
			{:else}
				<div class="cover-frame" aria-hidden="true"></div>
			{/if}
			<h1 class="overlay">{title}</h1>
		</div>

		{#each data.comic.panels as panel, index (panel.id)}
			{@const speech = panel.dialogue.map((line) => ({
				speaker: data.comic.characters.find(({ id }) => id === line.characterId)?.name,
				text: line.text,
			}))}
			<Section>
				<Heading class="visually-hidden">{m.panel({ number: index + 1 })}</Heading>
				<div class="picture">
					{#if panel.image}
						<PanelPicture image={panel.image} alt={panel.image.alt} />
					{:else}
						<div class="frame tone-{(index % 3) + 1}" aria-hidden="true"></div>
					{/if}
					<PanelBoxes captions={panel.captions} dialogue={speech} overlay={true} />
				</div>
			</Section>
		{/each}

		<div class="ending">
			<div class="end-line">
				<span>{m.theEnd()}</span>
				<span aria-hidden="true">·</span>
				<span>{countText}</span>
			</div>
			<ul class="end-links">
				<li>
					<a href={viewUrl} download={fileName} onclick={downloadComic}>{m.downloadComic()}</a>
				</li>
				<li>
					<a href={editUrl}><span aria-hidden="true">←</span> {m.backToEditing()}</a>
				</li>
				<li>
					<a href={resolve(localizedHref('/'))}>{m.allComics()}</a>
				</li>
			</ul>
		</div>
	</Page>
</div>

<style>
	.reader-header {
		position: sticky;
		inset-block-start: 0;
		z-index: 1;
		background: var(--color-reader-background);
		border-block-end: var(--border-width) solid var(--color-reader-border);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		max-inline-size: var(--width-content);
		margin-inline: auto;
		padding: var(--space-2) var(--space-3);
	}

	.title {
		flex: 1 1 auto;
		min-inline-size: 0;
		margin: 0;
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.link {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-inline-size: var(--control-min-size);
		min-block-size: var(--control-min-size);
		color: var(--color-reader-link);
		text-decoration: none;
	}

	.link svg {
		inline-size: var(--icon-size);
		block-size: var(--icon-size);
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* Below 48em the icons stand alone; their names come from aria-label. */
	.label {
		display: none;
	}

	.cover {
		position: relative;
		inline-size: 100%;
		margin-block-end: var(--space-2);
	}

	.cover :global(picture) {
		display: block;
	}

	.cover :global(img) {
		inline-size: 100%;
		block-size: auto;
	}

	.cover-frame {
		display: block;
		inline-size: 100%;
		aspect-ratio: var(--cover-aspect-ratio);
		background: var(--color-cover-placeholder);
	}

	/* Inverted box: the caption's colours swapped (dark box, cream text). */
	h1 {
		inline-size: fit-content;
		max-inline-size: 100%;
		margin: 0;
		padding: var(--space-2);
		border: var(--border-width-thick) solid var(--color-reader-border);
		background: var(--color-caption-text);
		color: var(--color-caption);
		font-size: var(--font-size-h2);
		overflow-wrap: anywhere;
	}

	/* Inset by the same space on both sides, so a long title keeps equal margins. */
	h1.overlay {
		position: absolute;
		inset-block-start: var(--space-2);
		inset-inline-start: var(--space-2);
		max-inline-size: calc(100% - 2 * var(--space-2));
	}

	/* Full width, almost full height; the gap below shows the next panel. The picture
	   is the positioning box for the overlaid boxes. */
	.picture {
		position: relative;
		inline-size: 100%;
		block-size: var(--viewer-panel-height);
		margin-block-end: var(--space-2);
		overflow: hidden;
	}

	.picture :global(picture) {
		display: block;
		block-size: 100%;
	}

	.picture :global(img) {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	/* A panel without an image: a frame the size of a panel image, cycled by panel index. */
	.frame {
		position: absolute;
		inset: 0;
	}

	.tone-1 {
		background: var(--color-panel-placeholder-1);
	}

	.tone-2 {
		background: var(--color-panel-placeholder-2);
	}

	.tone-3 {
		background: var(--color-panel-placeholder-3);
	}

	.ending {
		display: grid;
		gap: var(--space-3);
		margin-block: var(--space-5) var(--space-4);
		text-align: center;
	}

	.end-line {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-2);
		font-size: var(--font-size-h2);
		font-weight: var(--font-weight-semibold);
	}

	.ending a {
		color: var(--color-reader-link);
	}

	.end-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
