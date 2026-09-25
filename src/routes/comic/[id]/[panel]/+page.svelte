<script lang="ts">
	import Heading from '$lib/components/relativeHeading/Heading.svelte';
	import Section from '$lib/components/relativeHeading/Section.svelte';
	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<Section>
	<Heading>
		{data.panel.id}
	</Heading>
</Section>
