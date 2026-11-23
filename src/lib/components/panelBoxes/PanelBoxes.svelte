<script lang="ts">
	import type { PanelBoxesProps } from './panelBoxesTypes.ts';

	let { captions, dialogue, overlay }: PanelBoxesProps = $props();
</script>

<!--
	Overlay: the grid's top row holds captions (top-left), its bottom row the speech
	(bottom). Each column is half the picture, so a caption box can't cross the middle.
-->
<div class="boxes" class:overlay>
	{#if captions.length > 0}
		<ul class="captions">
			{#each captions as caption, index (index)}
				<li class="box">{caption}</li>
			{/each}
		</ul>
	{/if}
	{#if dialogue.length > 0}
		<ul class="speech">
			{#each dialogue as line, index (index)}
				<li class="box">
					{#if line.speaker}
						<strong>{line.speaker}</strong>
					{/if}
					{line.text}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.boxes {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2);
		margin-block-start: var(--space-2);
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
		margin: 0;
	}

	ul {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
		max-inline-size: 100%;
	}

	.overlay .captions {
		grid-area: 1 / 1;
		align-self: start;
		justify-self: start;
		margin: var(--space-2);
	}

	.speech .box {
		font-style: italic;
	}

	.overlay .speech {
		grid-area: 2 / 1 / 3 / -1;
		align-self: end;
		justify-self: start;
		margin: var(--space-2);
	}

	.box {
		max-inline-size: 100%;
		padding: var(--space-2);
		border: var(--border-width-thick) solid var(--color-border);
		background: var(--color-background);
		color: var(--color-text);
		font-size: var(--font-size-small);
		overflow-wrap: anywhere;
	}
</style>
