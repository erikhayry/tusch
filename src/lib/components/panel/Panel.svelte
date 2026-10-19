<script lang="ts" module>
	export const PanelTestId = 'panel-test-id';
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getCharacter } from '$lib/utils/db/db.svelte';
	import { DB_ITEM_TYPE } from '$lib/utils/db/dbTypes';
	import CreatePanelImageForm from '../forms/createPanelImageForm/CreatePanelImageForm.svelte';
	import DeleteItemForm from '../forms/deleteItemForm/DeleteItemForm.svelte';
	import Image from '../image/Image.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import FieldActions from './components/fieldActions/FieldActions.svelte';
	import { type PanelProps } from './panelTypes';

	let { number, totalNumberOfPanels, panel, comicId, style, characters }: PanelProps = $props();
</script>

<Section data-testId={PanelTestId}>
	<Heading>{number}/{totalNumberOfPanels}: {panel.editorialTitle}</Heading>
	<p>{panel.visualDescription}</p>
	{#if panel.image === undefined}
		<CreatePanelImageForm
			label={m.addImage()}
			values={{
				comicId,
				panel,
				characters,
				style,
			}}
		/>
	{:else}
		<Image image={panel.image} />
		<CreatePanelImageForm
			label={m.generateNewImage()}
			imageName={panel.image?.landscape.src}
			values={{
				comicId,
				panel,
				characters,
				style,
			}}
		/>
		<DeleteItemForm
			label={m.removeImage()}
			values={{ type: DB_ITEM_TYPE.enum.panelImage, comicId, panelId: panel.id }}
		/>
	{/if}

	<p>{m.timeOfDay()}: {panel.timeOfDay}</p>
	<p>{m.season()}: {panel.season}</p>
	<p>{m.year()}: {panel.year}</p>

	<Section>
		<Heading id="panel-caption">{m.captions()}</Heading>
		<ul aria-labelledby="panel-caption">
			{#each panel.captions as caption, index (caption)}
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

		<Heading id="panel-dialogue">{m.dialogues()}</Heading>
		<ul aria-labelledby="panel-dialogue">
			{#each panel.dialogue as dialogue, index (dialogue)}
				<li>
					<p>{getCharacter(comicId, dialogue.characterId)}</p>
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
