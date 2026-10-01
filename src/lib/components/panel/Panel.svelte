<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { FIELD } from '$lib/utils/db/dbTypes';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import FieldActions from './components/fieldActions/FieldActions.svelte';
	import { type PanelProps } from './panelTypes';
	import { ACTION } from './utils/actions';

	let { number, totalNumberOfPanels, panel, comicId }: PanelProps = $props();
</script>

<Section>
	<Heading>{m.panelTitle({ number, total: totalNumberOfPanels })}</Heading>

	{#if panel.image === undefined}
		<button type="button" onclick={() => {}}>{m.addImage()}</button>
	{:else}
		<img src={panel.image.wide.src} alt={panel.image.alt} />
		<form method="POST" action={`?/${ACTION.DELETE_IMAGE}`}>
			<input type="hidden" name="comicId" value={comicId} />
			<input type="hidden" name="panelId" value={panel.id} />
			<button type="submit">{m.removeImage()}</button>
		</form>
	{/if}

	<Section>
		<Heading id="panel-caption">{m.captions()}</Heading>
		<ul aria-labelledby="panel-caption">
			{#each panel.captions as caption, index (caption)}
				<li>
					<FieldActions
						field={FIELD.enum.captions}
						{comicId}
						panelId={panel.id}
						{index}
						value={caption}
						editActionLabel={m.editCaption}
						removeActionLabel={m.removeCaption}
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
						field={FIELD.enum.dialogue}
						{comicId}
						panelId={panel.id}
						{index}
						value={dialogue}
						editActionLabel={m.editDialogue}
						removeActionLabel={m.removeDialogue}
						saveActionLabel={m.saveDialogue}
					/>
				</li>
			{/each}
		</ul>
	</Section>
</Section>
