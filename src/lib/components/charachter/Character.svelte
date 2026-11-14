<script lang="ts">
	import {
		getCharacterGalleryImages,
		getPanelsWithCharachter,
	} from '$lib/features/comics/client/comic-selectors';
	import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
	import { m } from '$lib/paraglide/messages';
	import CreateCharacterImageForm from '../forms/createCharacterImageForm/CreateCharacterImageForm.svelte';
	import Image from '../image/Image.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type CharacterProps } from './characterTypes';

	let { character, comicId }: CharacterProps = $props();
	let panels = $derived(getPanelsWithCharachter(comicStore.comics, comicId, character.id));
	let gallery = $derived(getCharacterGalleryImages(comicStore.comics, comicId, character.id));
</script>

<Section>
	<Heading>{character.name}</Heading>
	{#if gallery.length}
		<ul class="gallery">
			{#each gallery as entry (entry.id)}
				{@const params = {
					name: character.name,
					number: entry.number,
					title: entry.panel.editorialTitle,
				}}
				<li>
					<details>
						<summary>
							<Image image={entry.head} alt={m.characterHeadAlt(params)} />
						</summary>
						<Image image={entry.full} alt={m.characterFullAlt(params)} />
					</details>
				</li>
			{/each}
		</ul>
	{:else}
		<p>{m.characterNoImages()}</p>
	{/if}
	<ul aria-label={m.characterPanels()}>
		{#each panels as panel (panel.id)}
			{@const landscape = panel.image?.landscape}
			{@const crop = landscape?.characters?.find(({ id }) => id === character.id)?.head}
			{@const stored = character.images.some((image) => image.panelId === panel.id)}
			<li>
				{panel.editorialTitle}
				{#if landscape && crop && !stored}
					<CreateCharacterImageForm
						label="create"
						values={{ comicId, characterId: character.id, image: landscape.src, crop }}
					/>
				{/if}
			</li>
		{/each}
	</ul>
</Section>

<style>
	.gallery {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		padding: 0;
		list-style: none;
	}

	.gallery :global(img) {
		max-width: 100%;
		height: auto;
		max-height: calc(var(--control-min-size) * 4);
	}
</style>
