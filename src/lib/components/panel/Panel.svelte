<script lang="ts" module>
	export const PanelTestId = 'panel-test-id';
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
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
	import { ImageVariantEnum, type ImageVariant } from '#lib/types/index.ts';
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

	let {
		number,
		totalNumberOfPanels,
		panel,
		comicId,
		style,
		customStyle,
		characters,
		afterDeletePanelId,
	}: PanelProps = $props();

	const characterReferences = $derived(
		getCharacterReferenceGroups(comicStore.comics, comicId, panel.id),
	);
	const imageFormat = $derived(getImageFormat(comicStore.comics, comicId));

	/**
	 * A one-format comic has a Portrait/Landscape switch (REQ-279-1). It starts on the
	 * format's variant and only changes which stored variant is shown; the format stays.
	 */
	let picked = $state<{ panelId: string; variant: ImageVariant }>();
	const formatVariant = $derived(imageFormat === 'both' ? undefined : imageFormat);
	const shownVariant = $derived(picked?.panelId === panel.id ? picked.variant : formatVariant);
	const visibleVariants = $derived(
		panel.image
			? storedVariants(panel.image).filter(
					({ variant }) => shownVariant === undefined || variant === shownVariant,
				)
			: [],
	);
	/** The variant the format (or the switch) asks for that the image lacks (REQ-279-1). */
	const missingVariant = $derived.by(() => {
		if (!panel.image) {
			return undefined;
		}
		if (shownVariant === undefined) {
			return missingVariantFor(panel.image, imageFormat);
		}
		return visibleVariants.length === 0 ? shownVariant : undefined;
	});

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

	/**
	 * Deleting unmounts this panel's data before the form's callback runs, so the page
	 * it should open is read when the form is submitted.
	 */
	let deletedNextPanelId: string | undefined;
</script>

<Section class="panel" data-testId={PanelTestId}>
	<p class="position">{m.panelOfTotal({ number, total: totalNumberOfPanels })}</p>
	<Heading tabindex={-1}>{panel.editorialTitle || m.panel({ number })}</Heading>

	<div class="editor" class:single={!panel.image || visibleVariants.length === 1}>
		{#if panel.image}
			<div class="pictures" class:pair={visibleVariants.length === 2}>
				{#each visibleVariants as { variant, asset } (variant)}
					<figure>
						<Image image={asset} alt={panel.image.alt} />
						<figcaption>{VARIANT_LABELS[variant]()}</figcaption>
					</figure>
				{/each}
			</div>
		{/if}

		<div class="cards">
			<Section class="card">
				<Heading>{m.scene()}</Heading>
				<p>{panel.visualDescription}</p>
				<p class="facts">
					<span class="pill">{m.timeOfDay()}: {panel.timeOfDay}</span>
					<span class="pill">{m.season()}: {panel.season}</span>
					<span class="pill">{m.year()}: {panel.year}</span>
				</p>
			</Section>

			<Section class="card">
				<Heading>{m.generateImage()}</Heading>
				{#if panel.image === undefined}
					<CreatePanelImageForm
						panelNumber={number}
						panelTitle={panel.editorialTitle}
						label={m.addImage()}
						{characterReferences}
						values={toCreatePanelImageValues(
							comicId,
							panel,
							characters,
							style,
							imageFormat,
							customStyle,
						)}
						bind:submitButton={addImageButton}
					/>
				{:else}
					{#if formatVariant}
						<div class="switch">
							{#each ImageVariantEnum.options as variant (variant)}
								<!-- An icon, not the word: the name is the label, and the word stays a caption. -->
								<button
									type="button"
									class="switch-option"
									aria-label={VARIANT_LABELS[variant]()}
									title={VARIANT_LABELS[variant]()}
									aria-pressed={shownVariant === variant}
									onclick={() => (picked = { panelId: panel.id, variant })}
								>
									<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
										{#if variant === ImageVariantEnum.enum.portrait}
											<rect x="7" y="3" width="10" height="18" />
										{:else}
											<rect x="3" y="7" width="18" height="10" />
										{/if}
									</svg>
								</button>
							{/each}
						</div>
					{/if}
					{#if missingVariant}
						<!-- While a variant is missing, only that variant is offered: the two forms
						     would both have an instructions field, and regenerating replaces both. -->
						<CreatePanelImageForm
							panelNumber={number}
							panelTitle={panel.editorialTitle}
							label={CREATE_LABELS[missingVariant]()}
							baseImage={primaryVariant(panel.image)?.asset.src}
							{characterReferences}
							values={toCreatePanelImageValues(
								comicId,
								panel,
								characters,
								style,
								missingVariant,
								customStyle,
							)}
							bind:submitButton={createVariantButton}
							onSuccess={() => focusAfterUpdate(() => generateImageButton)}
						/>
					{:else}
						<CreatePanelImageForm
							panelNumber={number}
							panelTitle={panel.editorialTitle}
							label={m.generateNewImage()}
							imageName={primaryVariant(panel.image)?.asset.src}
							imageVariant={primaryVariant(panel.image)?.variant}
							{characterReferences}
							values={toCreatePanelImageValues(
								comicId,
								panel,
								characters,
								style,
								imageFormat,
								customStyle,
							)}
							bind:submitButton={generateImageButton}
						/>
					{/if}
					<div class="image-actions">
						{#if storedVariants(panel.image).length === 2}
							{#each storedVariants(panel.image) as { variant } (variant)}
								<RemovePanelImageVariantForm
									label={REMOVE_LABELS[variant]()}
									{comicId}
									panelId={panel.id}
									{variant}
									onSuccess={() =>
										focusAfterUpdate(() => createVariantButton ?? generateImageButton)}
								/>
							{/each}
						{:else}
							<DeleteItemForm
								danger
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
					</div>
				{/if}
			</Section>

			<Section class="card">
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
			</Section>

			<Section class="card">
				<Heading id="panel-dialogue">{m.dialogues()}</Heading>
				<ul class="dialogue" aria-labelledby="panel-dialogue">
					{#each panel.dialogue as dialogue, index (dialogue)}
						<li>
							<Image
								class="avatar"
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
		</div>
	</div>

	<!-- Submitting captures the target: the delete unmounts this page's data before onSuccess. -->
	<div class="delete" onsubmitcapture={() => (deletedNextPanelId = afterDeletePanelId)}>
		<DeleteItemForm
			danger
			label={m.deletePanel({ number })}
			values={{ type: DB_ITEM_TYPE.enum.panels, comicId, panelId: panel.id }}
			onSuccess={() => {
				void goto(
					deletedNextPanelId
						? resolve(`comic/${comicId}/${deletedNextPanelId}`)
						: resolve(`comic/${comicId}`),
				);
			}}
		/>
	</div>
</Section>

<style>
	.position {
		margin: 0;
		color: var(--color-muted);
	}

	.editor {
		display: grid;
		gap: var(--space-4);
		/* Room for the fixed Prev/Next bar below 48em. */
		padding-block-end: var(--pager-clearance);
	}

	.pictures {
		display: grid;
		gap: var(--space-3);
		max-inline-size: var(--width-panel-image);
	}

	/* Portrait and landscape side by side from 48em: widths about 3:4. */
	.pictures.pair {
		max-inline-size: none;
	}

	figure {
		margin: 0;
		min-inline-size: 0;
	}

	.pictures :global(img) {
		inline-size: 100%;
		block-size: auto;
	}

	.cards {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		min-inline-size: 0;
	}

	.cards > :global(section) {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		padding: var(--space-3);
		background: var(--color-surface);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius);
	}

	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0;
	}

	.pill {
		padding: var(--space-1) var(--space-3);
		color: var(--color-text);
		background: var(--color-background);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius-pill);
	}

	.switch {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	/* The pressed choice is filled, like the primary button, so it reads without colour. */
	.switch-option {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: var(--control-min-size);
		margin: 0;
		padding: 0;
		color: var(--color-text);
		background: var(--color-background);
	}

	.switch-option[aria-pressed='true'] {
		color: var(--color-background);
		background: var(--color-text);
	}

	.switch-option svg {
		inline-size: var(--icon-size);
		block-size: var(--icon-size);
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
	}

	.image-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
	}

	.image-actions :global(button) {
		margin: 0;
	}

	.speaker {
		margin: 0;
		color: var(--color-speaker);
	}

	/* A row per line of dialogue: avatar and speaker, then the text and its actions. */
	.dialogue {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.dialogue li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.dialogue :global(img.avatar) {
		inline-size: var(--avatar-size);
		block-size: var(--avatar-size);
		object-fit: cover;
		border-radius: var(--radius-pill);
	}

	.delete {
		display: flex;
		justify-content: flex-start;
	}

	.delete :global(button) {
		margin: 0;
	}

	@media (min-width: 48em) {
		.editor {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: start;
			padding-block-end: 0;
		}

		.editor.single {
			grid-template-columns: minmax(0, 1fr);
		}

		.pictures.pair {
			grid-template-columns: 3fr 4fr;
		}

		.dialogue :global(img.avatar) {
			inline-size: var(--avatar-size-wide);
			block-size: var(--avatar-size-wide);
		}
	}
</style>
