<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type PanelProps } from './panelTypes';
	import { ACTION } from './utils/actions';

	let currentCaption = $state<number | null>(null);
	let currentDialogue = $state<number | null>(null);

	let { number, totalNumberOfPanels, panel, comicId }: PanelProps = $props();

	function startEditingCaption(index: number) {
		currentCaption = index;
	}

	function startEditingDialogue(index: number) {
		currentDialogue = index;
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
					{#if currentCaption === index}
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
						<button type="button" onclick={() => startEditingCaption(index)}>
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
					{#if currentDialogue === index}
						<form>
							<label>
								<span>{m.editDialogue({ number: index + 1 })}</span>
								<input type="text" value={dialogue} />
							</label>
						</form>
					{:else}
						{dialogue}
						<button type="button" onclick={() => startEditingDialogue(index)}>
							{m.editDialogue({ number: index + 1 })}
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	</Section>
</Section>
