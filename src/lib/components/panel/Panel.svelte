<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type PanelProps } from './panelTypes';
	import { ACTION } from './utils/actions';

	const EDITABLE_TYPE = {
		CAPTION: 'caption',
		DIALOGUE: 'dialogue',
	} as const;
	type EditableType = (typeof EDITABLE_TYPE)[keyof typeof EDITABLE_TYPE];

	let currentEditable = $state<{
		index: number;
		type: EditableType;
	} | null>(null);

	let { number, totalNumberOfPanels, panel, comicId }: PanelProps = $props();

	function startEditing(index: number, type: EditableType) {
		currentEditable = { index, type };
	}
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
					{#if currentEditable?.type === EDITABLE_TYPE.CAPTION && currentEditable?.index === index}
						<form method="POST" action={`?/${ACTION.EDIT_CAPTION}`}>
							<input type="hidden" name="comicId" value={comicId} />
							<input type="hidden" name="panelId" value={panel.id} />
							<input type="hidden" name="captionIndex" value={index} />
							<label>
								<span>{m.editCaption({ number: index + 1 })}</span>
								<input type="text" name="caption" value={caption} />
							</label>
							<button type="submit">{m.saveCaption()}</button>
						</form>
					{:else}
						<p>{caption}</p>
						<button type="button" onclick={() => startEditing(index, EDITABLE_TYPE.CAPTION)}>
							{m.editCaption({ number: index + 1 })}
						</button>
					{/if}
				</li>
			{/each}
		</ul>

		<Heading id="panel-dialogue">{m.dialogues()}</Heading>
		<ul aria-labelledby="panel-dialogue">
			{#each panel.dialogue as dialogue, index (dialogue)}
				<li>
					{#if currentEditable?.type === EDITABLE_TYPE.DIALOGUE && currentEditable?.index === index}
						<form>
							<label>
								<span>{m.editDialogue({ number: index + 1 })}</span>
								<input type="text" value={dialogue} />
							</label>
						</form>
					{:else}
						{dialogue}
						<button type="button" onclick={() => startEditing(index, EDITABLE_TYPE.DIALOGUE)}>
							{m.editDialogue({ number: index + 1 })}
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	</Section>
</Section>
