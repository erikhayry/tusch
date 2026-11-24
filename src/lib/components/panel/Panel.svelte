<script lang="ts" module>
	export const PanelTestId = 'panel-test-id';
</script>

<script lang="ts">
	import {
		getCharacterImageForPanel,
		getCharacterReferenceGroups,
		getCharacterName,
		getImageFormat,
	} from '#lib/features/comics/client/comic-selectors.ts';
	import { comicStore } from '#lib/features/comics/client/comic-store.svelte.ts';
	import { toCreatePanelImageValues } from '#lib/features/panels/contracts/createPanelImage.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { missingVariantFor, primaryVariant, storedVariants } from '#lib/types/image-variants.ts';
	import type { ImageVariant } from '#lib/types/index.ts';
	import { DB_ITEM_TYPE } from '#lib/utils/db/dbTypes.ts';
	import { tick } from 'svelte';
	import AddCaptionForm from '../forms/addCaptionForm/AddCaptionForm.svelte';
	import CreatePanelImageForm from '../forms/createPanelImageForm/CreatePanelImageForm.svelte';
	import DeleteItemForm from '../forms/deleteItemForm/DeleteItemForm.svelte';
	import RemovePanelImageVariantForm from '../forms/removePanelImageVariantForm/RemovePanelImageVariantForm.svelte';
	import RestorePanelImageForm from '../forms/restorePanelImageForm/RestorePanelImageForm.svelte';
	import Image from '../image/Image.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import FieldActions from './components/fieldActions/FieldActions.svelte';
	import { type PanelProps } from './panelTypes';

	let { number, totalNumberOfPanels, panel, comicId, style, characters }: PanelProps = $props();

	const characterReferences = $derived(
		getCharacterReferenceGroups(comicStore.comics, comicId, panel.id),
	);
	const imageFormat = $derived(getImageFormat(comicStore.comics, comicId));
	/** The variant the format asks for that the image lacks (REQ-279-1). */
	const missingVariant = $derived(
		panel.image ? missingVariantFor(panel.image, imageFormat) : undefined,
	);

	const VARIANT_LABELS: Record<ImageVariant, () => string> = {
		portrait: () => m.portraitImage(),
		landscape: () => m.landscapeImage(),
	};
	const CREATE_LABELS: Record<ImageVariant, () => string> = {
		portrait: () => m.createPortraitImage(),
		landscape: () => m.createLandscapeImage(),
	};
	const REMOVE_LABELS: Record<ImageVariant, () => string> = {
		portrait: () => m.removePortraitImage(),
		landscape: () => m.removeLandscapeImage(),
	};

	let generateImageButton = $state<HTMLButtonElement>();
	let addImageButton = $state<HTMLButtonElement>();
	let createVariantButton = $state<HTMLButtonElement>();

	/**
	 * Restore and remove swap out the control that had focus, which drops focus to
	 * <body>. Wait for the DOM to update, then focus the control that replaces it.
	 */
	async function focusAfterUpdate(button: () => HTMLButtonElement | undefined) {
		await tick();
		button()?.focus();
	}
</script>

<Section data-testId={PanelTestId}>
	<p class="position">{m.panelOfTotal({ number, total: totalNumberOfPanels })}</p>
	<Heading>{panel.editorialTitle || m.panel({ number })}</Heading>
	<p>{panel.visualDescription}</p>
	{#if panel.image === undefined}
		<CreatePanelImageForm
			label={m.addImage()}
			{characterReferences}
			values={toCreatePanelImageValues(comicId, panel, characters, style, imageFormat)}
			bind:submitButton={addImageButton}
		/>
	{:else}
		{#each storedVariants(panel.image) as { variant, asset } (variant)}
			<figure>
				<Image image={asset} alt={panel.image.alt} />
				<figcaption>{VARIANT_LABELS[variant]()}</figcaption>
			</figure>
		{/each}
		{#if missingVariant}
			<!-- While a variant is missing, only that variant is offered: the two forms
			     would both have an instructions field, and regenerating replaces both. -->
			<CreatePanelImageForm
				label={CREATE_LABELS[missingVariant]()}
				baseImage={primaryVariant(panel.image)?.asset.src}
				{characterReferences}
				values={toCreatePanelImageValues(comicId, panel, characters, style, missingVariant)}
				bind:submitButton={createVariantButton}
				onSuccess={() => focusAfterUpdate(() => generateImageButton)}
			/>
		{:else}
			<CreatePanelImageForm
				label={m.generateNewImage()}
				imageName={primaryVariant(panel.image)?.asset.src}
				imageVariant={primaryVariant(panel.image)?.variant}
				{characterReferences}
				values={toCreatePanelImageValues(comicId, panel, characters, style, imageFormat)}
				bind:submitButton={generateImageButton}
			/>
		{/if}
		{#if storedVariants(panel.image).length === 2}
			{#each storedVariants(panel.image) as { variant } (variant)}
				<RemovePanelImageVariantForm
					label={REMOVE_LABELS[variant]()}
					{comicId}
					panelId={panel.id}
					{variant}
					onSuccess={() => focusAfterUpdate(() => createVariantButton ?? generateImageButton)}
				/>
			{/each}
		{:else}
			<DeleteItemForm
				label={m.removeImage()}
				values={{ type: DB_ITEM_TYPE.enum.panelImage, comicId, panelId: panel.id }}
				onSuccess={() => focusAfterUpdate(() => addImageButton)}
			/>
		{/if}
		{#if panel.previousImage}
			<RestorePanelImageForm
				{comicId}
				panelId={panel.id}
				onSuccess={() => focusAfterUpdate(() => generateImageButton)}
			/>
		{/if}
	{/if}

	<p>{m.timeOfDay()}: {panel.timeOfDay}</p>
	<p>{m.season()}: {panel.season}</p>
	<p>{m.year()}: {panel.year}</p>

	<Section>
		<Heading id="panel-caption">{m.captions()}</Heading>
		<ul aria-labelledby="panel-caption">
			{#each panel.captions as caption, index (index)}
				<li>
					<FieldActions
						values={{
							type: DB_ITEM_TYPE.enum.captions,
							comicId,
							panelId: panel.id,
							index,
							value: caption,
						}}
						visibleText={caption}
						editActionLabel={m.editCaption}
						removeActionLabel={m.deleteCaption}
						saveActionLabel={m.saveCaption}
					/>
				</li>
			{/each}
		</ul>
		<AddCaptionForm {comicId} panelId={panel.id} />

		<Heading id="panel-dialogue">{m.dialogues()}</Heading>
		<ul aria-labelledby="panel-dialogue">
			{#each panel.dialogue as dialogue, index (dialogue)}
				<li>
					<Image
						width={50}
						height={50}
						image={getCharacterImageForPanel(
							comicStore.comics,
							comicId,
							panel.id,
							dialogue.characterId,
						)}
						alt={m.characterHead({
							name: getCharacterName(comicStore.comics, comicId, dialogue.characterId) ?? '',
						})}
					/>
					<p class="speaker">
						{getCharacterName(comicStore.comics, comicId, dialogue.characterId)}
					</p>
					<FieldActions
						values={{
							type: DB_ITEM_TYPE.enum.dialogue,
							comicId,
							panelId: panel.id,
							index,
							value: dialogue.text,
						}}
						visibleText={dialogue.text}
						editActionLabel={m.editDialogue}
						removeActionLabel={m.deleteDialogue}
						saveActionLabel={m.saveDialogue}
					/>
				</li>
			{/each}
		</ul>
	</Section>
</Section>

<style>
	.position {
		color: var(--color-muted);
	}

	.speaker {
		color: var(--color-speaker);
	}
</style>
