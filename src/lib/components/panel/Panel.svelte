<script lang="ts" module>
	export const PanelTestId = 'panel-test-id';
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { DB_ITEM_TYPE } from '$lib/utils/db/dbTypes';
	import CreateImageForm from '../forms/createImageForm/CreateImageForm.svelte';
	import DeleteItemForm from '../forms/deleteItemForm/DeleteItemForm.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import FieldActions from './components/fieldActions/FieldActions.svelte';
	import PanelImage from './components/panelImage/PanelImage.svelte';
	import { type PanelProps } from './panelTypes';

	let { number, totalNumberOfPanels, panel, comicId }: PanelProps = $props();
</script>

<Section data-testId={PanelTestId}>
	<Heading>{m.panelTitle({ number, total: totalNumberOfPanels })}</Heading>
	<p>{panel.visualDescription}</p>
	{#if panel.image === undefined}
		<CreateImageForm
			label={m.addImage()}
			values={{ comicId, panelJsonString: JSON.stringify(panel) }}
		/>
	{:else}
		<PanelImage {panel} />
		<CreateImageForm
			label={m.generateNewImage()}
			values={{ comicId, panelJsonString: JSON.stringify(panel) }}
		/>
		<DeleteItemForm
			label={m.removeImage()}
			values={{ type: DB_ITEM_TYPE.enum.image, comicId, panelId: panel.id }}
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
