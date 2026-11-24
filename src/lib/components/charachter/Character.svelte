<script lang="ts">
	import {
		appearsInLabel,
		getCharacterGalleryImages,
		getComic,
		getPanelsWithCharachter,
	} from '#lib/features/comics/client/comic-selectors.ts';
	import { comicStore } from '#lib/features/comics/client/comic-store.svelte.ts';
	import { toCharacterPrompt } from '#lib/features/comics/contracts/prompts.ts';
	import { primaryVariant } from '#lib/types/image-variants.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { tick } from 'svelte';
	import CreateCharacterImageForm from '../forms/createCharacterImageForm/CreateCharacterImageForm.svelte';
	import FixCharacterCropForm from '../forms/fixCharacterCropForm/FixCharacterCropForm.svelte';
	import UndoCharacterCropFixForm from '../forms/undoCharacterCropFixForm/UndoCharacterCropFixForm.svelte';
	import Image from '../image/Image.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type CharacterProps } from './characterTypes';

	let { character, comicId }: CharacterProps = $props();
	let panels = $derived(getPanelsWithCharachter(comicStore.comics, comicId, character.id));
	let comic = $derived(getComic(comicStore.comics, comicId));
	let gallery = $derived(getCharacterGalleryImages(comicStore.comics, comicId, character.id));

	let fixButtons = $state<Record<string, HTMLButtonElement | undefined>>({});

	/**
	 * Undo removes its own button, which drops focus to <body>. Wait for the DOM to
	 * update, then focus the crop's "Fix crop" button, which stays in place.
	 */
	async function focusFixAfterUndo(characterImageId: string) {
		await tick();
		fixButtons[characterImageId]?.focus();
	}
</script>

<Section>
	<Heading>{character.name}</Heading>
	<p class="appears">{appearsInLabel(panels?.length ?? 0)}</p>
	{#if gallery.length}
		<ul class="gallery">
			{#each gallery as entry (entry.id)}
				{@const params = {
					name: character.name,
					number: entry.number,
					title: entry.panel.editorialTitle,
				}}
				{@const primary = primaryVariant(entry.panel.image)?.asset}
				{@const current = primary?.characters?.find(({ id }) => id === character.id)}
				<li>
					<details>
						<summary aria-label={m.characterHeadAlt(params)}>
							<Image image={entry.head} alt="" class="head" />
						</summary>
						<Image image={entry.full} alt={m.characterFullAlt(params)} />
						{#if primary}
							<FixCharacterCropForm
								bind:submitButton={fixButtons[entry.id]}
								label={m.fixCharacterCrop(params)}
								values={{
									comicId,
									panelId: entry.panel.id,
									characterId: character.id,
									characterImageId: entry.id,
									character: toCharacterPrompt(character),
									width: primary.width,
									height: primary.height,
									current: current && { head: current.head, full: current.full },
								}}
								imageAssetId={primary.src}
							/>
						{/if}
						{#if entry.canUndoFix}
							<UndoCharacterCropFixForm
								label={m.undoCharacterCropFix(params)}
								values={{ comicId, characterId: character.id, characterImageId: entry.id }}
								onSuccess={() => focusFixAfterUndo(entry.id)}
							/>
						{/if}
					</details>
				</li>
			{/each}
		</ul>
	{:else}
		<p>{m.characterNoImages()}</p>
	{/if}
	<ul aria-label={m.characterPanels()}>
		{#each panels as panel (panel.id)}
			{@const primary = primaryVariant(panel.image)?.asset}
			{@const crop = primary?.characters?.find(({ id }) => id === character.id)?.head}
			{@const stored = character.images.some((image) => image.panelId === panel.id)}
			<li>
				{panel.editorialTitle}
				{#if primary && crop && !stored}
					<CreateCharacterImageForm
						label={m.characterPreviewCrop({
							name: character.name,
							number: (comic?.panels.findIndex(({ id }) => id === panel.id) ?? 0) + 1,
						})}
						values={{ comicId, characterId: character.id, image: primary.src, crop }}
					/>
				{/if}
			</li>
		{/each}
	</ul>
</Section>

<style>
	.appears {
		margin-block: 0 var(--space-2);
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}

	.gallery {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		padding: 0;
		list-style: none;
	}

	/* The img is rendered by Image, so the scoped class needs :global to reach it. */
	.gallery :global(.head) {
		max-width: 100%;
		height: auto;
		max-height: calc(var(--control-min-size) * 4);
	}

	/*
	 * A closed crop's content is removed from layout outright. Under load, Chromium's
	 * <details> open animation can leave the full-body image with a 0 px box after it
	 * opens (#309), so the browser's own closed-content box is not relied on.
	 */
	.gallery details:not([open]) > :global(*:not(summary)) {
		display: none;
	}
</style>
