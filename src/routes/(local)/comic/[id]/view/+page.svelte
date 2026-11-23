<script lang="ts">
	import { resolve } from '$app/paths';
	import PanelPicture from '#lib/components/image/PanelPicture.svelte';
	import PanelBoxes from '#lib/components/panelBoxes/PanelBoxes.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import Heading from '#lib/components/relativeHeading/Heading.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { Data } from '../+page';

	let { data }: { data: Data } = $props();
	const title = $derived(data.comic.title.trim() || m.untitledComic());
</script>

<Page {title} showTitle={false}>
	<!-- The title is an inverted caption over the cover, or on its own without one. -->
	<div class="cover">
		{#if data.comic.cover}
			<PanelPicture image={data.comic.cover} alt={data.comic.cover.alt} />
		{/if}
		<h1 class:overlay={Boolean(data.comic.cover)}>{title}</h1>
	</div>

	{#each data.comic.panels as panel, index (panel.id)}
		{@const speech = panel.dialogue.map((line) => ({
			speaker: data.comic.characters.find(({ id }) => id === line.characterId)?.name,
			text: line.text,
		}))}
		<Section>
			<Heading class="visually-hidden">{m.panel({ number: index + 1 })}</Heading>
			{#if panel.image}
				<div class="picture">
					<PanelPicture image={panel.image} alt={panel.image.alt} />
					<PanelBoxes captions={panel.captions} dialogue={speech} overlay={true} />
				</div>
			{:else}
				<PanelBoxes captions={panel.captions} dialogue={speech} overlay={false} />
			{/if}
		</Section>
	{/each}

	<a href={resolve(`comic/${data.comic.id}`)}>{m.back()}</a>
</Page>

<style>
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

	/* Inverted box: the caption style with text and background swapped. */
	h1 {
		inline-size: fit-content;
		max-inline-size: 100%;
		margin: 0;
		padding: var(--space-2);
		border: var(--border-width-thick) solid var(--color-border);
		background: var(--color-text);
		color: var(--color-background);
		font-size: var(--font-size-h2);
		overflow-wrap: anywhere;
	}

	h1.overlay {
		position: absolute;
		inset-block-start: var(--space-2);
		inset-inline-start: var(--space-2);
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
</style>
