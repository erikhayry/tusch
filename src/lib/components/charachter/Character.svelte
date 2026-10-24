<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getPanelsWithCharachter } from '$lib/utils/db/db.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type CharacterProps } from './characterTypes';

	let { character, comicId }: CharacterProps = $props();
	let panels = $derived(getPanelsWithCharachter(comicId, character.id));
</script>

<Section>
	<Heading>{character.name}</Heading>
	<ul aria-label={m.characterPanels()}>
		{#each panels as panel (panel.id)}
			<li>
				{panel.editorialTitle}
				<br />
				Is generated: {Boolean(character.images.find((image) => image.panelId === panel.id))}
			</li>
		{/each}
	</ul>
</Section>
