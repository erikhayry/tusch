<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { FIELD } from '$lib/utils/db/dbTypes';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import RemoveFieldItemForm from '../removeFieldItemForm/RemoveFieldItemForm.svelte';
	import TextFieldForm from '../textFieldForm/TextFieldForm.svelte';
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
					<TextFieldForm
						action={ACTION.EDIT_FIELD_ITEM}
						field={{ value: caption, name: 'value' }}
						label={m.editCaption({ number: index + 1 })}
						values={[
							{ name: 'comicId', value: comicId },
							{ name: 'panelId', value: panel.id },
							{ name: 'index', value: index },
							{ name: 'field', value: FIELD.enum.captions },
						]}
						saveActionLabel={m.saveCaption()}
						editActionLabel={m.editCaption({ number: index + 1 })}
					/>
					<RemoveFieldItemForm
						action={ACTION.DELETE_FIELD_ITEM}
						values={[
							{ name: 'comicId', value: comicId },
							{ name: 'panelId', value: panel.id },
							{ name: 'index', value: index },
							{ name: 'field', value: FIELD.enum.captions },
						]}
						label={m.removeCaption({ number: index + 1 })}
					/>
				</li>
			{/each}
		</ul>

		<Heading id="panel-dialogue">{m.dialogues()}</Heading>
		<ul aria-labelledby="panel-dialogue">
			{#each panel.dialogue as dialogue, index (dialogue)}
				<li>
					<TextFieldForm
						action={ACTION.EDIT_FIELD_ITEM}
						field={{ value: dialogue, name: 'value' }}
						label={m.editDialogue({ number: index + 1 })}
						values={[
							{ name: 'comicId', value: comicId },
							{ name: 'panelId', value: panel.id },
							{ name: 'index', value: index },
							{ name: 'field', value: FIELD.enum.dialogue },
						]}
						saveActionLabel={m.saveDialogue()}
						editActionLabel={m.editDialogue({ number: index + 1 })}
					/>
					<RemoveFieldItemForm
						action={ACTION.DELETE_FIELD_ITEM}
						values={[
							{ name: 'comicId', value: comicId },
							{ name: 'panelId', value: panel.id },
							{ name: 'index', value: index },
							{ name: 'field', value: FIELD.enum.dialogue },
						]}
						label={m.removeDialogue({ number: index + 1 })}
					/>
				</li>
			{/each}
		</ul>
	</Section>
</Section>
