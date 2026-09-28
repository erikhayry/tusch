<script lang="ts">
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type CharacterProps } from './characterTypes';

	let { character }: CharacterProps = $props();
</script>

<Section>
	<Heading>{character.name}</Heading>
</Section>
