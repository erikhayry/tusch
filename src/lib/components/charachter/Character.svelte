<script lang="ts">
	import { type CharacterProps } from './characterTypes';

	let { character }: CharacterProps = $props();
</script>

<h3>{character.name}</h3>
<p>{character.description}</p>
{#each character.images as image (image)}
	<img src={image} alt="TODO" />
{/each}
