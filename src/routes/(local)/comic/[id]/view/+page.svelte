<script lang="ts">
	import { resolve } from '$app/paths';
	import Image from '#lib/components/image/Image.svelte';
	import PanelPicture from '#lib/components/image/PanelPicture.svelte';
	import PanelBoxes from '#lib/components/panelBoxes/PanelBoxes.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import Heading from '#lib/components/relativeHeading/Heading.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { Data } from '../+page';

	let { data }: { data: Data } = $props();
</script>

<Page title={data.comic.title.trim() || m.untitledComic()}>
	{#if data.comic.cover}
		<Image image={data.comic.cover.landscape} alt={data.comic.cover.alt} />
	{/if}

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
