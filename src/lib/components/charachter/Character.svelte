<script lang="ts">
	import { getPanelsWithCharachter } from '$lib/features/comics/client/comic-selectors';
	import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
	import { m } from '$lib/paraglide/messages';
	import CreateCharacterImageForm from '../forms/createCharacterImageForm/CreateCharacterImageForm.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type CharacterProps } from './characterTypes';

	let { character, comicId }: CharacterProps = $props();
	let panels = $derived(getPanelsWithCharachter(comicStore.comics, comicId, character.id));
</script>

<Section>
	<Heading>{character.name}</Heading>
	<ul aria-label={m.characterPanels()}>
		{#each panels as panel (panel.id)}
			<li>
				{panel.editorialTitle}
				<br />
				Is generated: {Boolean(character.images.find((image) => image.panelId === panel.id))}
				<CreateCharacterImageForm
					label="create"
					values={{
						comicId,
						characterId: character.id,
						image: panel.image!.landscape.src,
						crop: panel.image!.landscape.characters![0].head,
					}}
				/>
			</li>
		{/each}
	</ul>
</Section>
