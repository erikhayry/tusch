<script lang="ts">
	import Heading from '$lib/components/relativeHeading/Heading.svelte';
	import Section from '$lib/components/relativeHeading/Section.svelte';
	import { type InputProps } from './inputTypes';

	let { input }: InputProps = $props();
</script>

<Section>
	<Heading>{ input.name }</Heading>
</Section>
