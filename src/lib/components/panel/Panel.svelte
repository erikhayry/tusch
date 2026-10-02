<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { DB_ITEM_TYPE } from '$lib/utils/db/dbTypes';
	import DeleteItemForm from '../forms/deleteItemForm/DeleteItemForm.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import FieldActions from './components/fieldActions/FieldActions.svelte';
	import { type PanelProps } from './panelTypes';

	let { number, totalNumberOfPanels, panel, comicId }: PanelProps = $props();
</script>

<Section>
	<Heading>{m.panelTitle({ number, total: totalNumberOfPanels })}</Heading>

	{#if panel.image === undefined}
		<button type="button" onclick={() => {}}>{m.addImage()}</button>
	{:else}
		<img src={panel.image.wide.src} alt={panel.image.alt} />
		<DeleteItemForm
			label={m.removeImage()}
			values={{ type: DB_ITEM_TYPE.enum.image, comicId, panelId: panel.id }}
		/>
	{/if}

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
							value: dialogue,
						}}
						editActionLabel={m.editDialogue}
						removeActionLabel={m.deleteDialogue}
						saveActionLabel={m.saveDialogue}
					/>
				</li>
			{/each}
		</ul>
	</Section>
</Section>
