<script lang="ts">
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type CharacterProps } from './characterTypes';

	let { character }: CharacterProps = $props();
</script>

<Section>
	<Heading>{character.name}</Heading>
	<p>{character.description}</p>
	{#each character.images as image (image)}
		<img src={image} alt="TODO" />
	{/each}
</Section>
