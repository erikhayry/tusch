<script lang="ts" module>
	export const PanelTestId = 'panel-test-id';
</script>

<script lang="ts">
	import {
		getCharacterImageForPanel,
		getCharacterReferenceGroups,
		getCharacterName,
	} from '$lib/features/comics/client/comic-selectors';
	import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
	import { toCreatePanelImageValues } from '$lib/features/panels/contracts/createPanelImage';
	import { m } from '$lib/paraglide/messages';
	import { DB_ITEM_TYPE } from '$lib/utils/db/dbTypes';
	import { tick } from 'svelte';
	import AddCaptionForm from '../forms/addCaptionForm/AddCaptionForm.svelte';
	import CreatePanelImageForm from '../forms/createPanelImageForm/CreatePanelImageForm.svelte';
	import DeleteItemForm from '../forms/deleteItemForm/DeleteItemForm.svelte';
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

	let generateImageButton = $state<HTMLButtonElement>();
	let addImageButton = $state<HTMLButtonElement>();

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
	<Heading>{number}/{totalNumberOfPanels}: {panel.editorialTitle}</Heading>
	<p>{panel.visualDescription}</p>
	{#if panel.image === undefined}
		<CreatePanelImageForm
			label={m.addImage()}
			{characterReferences}
			values={toCreatePanelImageValues(comicId, panel, characters, style)}
			bind:submitButton={addImageButton}
		/>
	{:else}
		<Image image={panel.image.landscape} alt={panel.image.alt} />
		<CreatePanelImageForm
			label={m.generateNewImage()}
			imageName={panel.image?.landscape.src}
			{characterReferences}
			values={toCreatePanelImageValues(comicId, panel, characters, style)}
			bind:submitButton={generateImageButton}
		/>
		<DeleteItemForm
			label={m.removeImage()}
			values={{ type: DB_ITEM_TYPE.enum.panelImage, comicId, panelId: panel.id }}
			onSuccess={() => focusAfterUpdate(() => addImageButton)}
		/>
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
						alt="charachter"
					/>
					<p>{getCharacterName(comicStore.comics, comicId, dialogue.characterId)}</p>
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
