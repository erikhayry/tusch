<script lang="ts">
	import Page from '$lib/components/page/Page.svelte';
	import Heading from '$lib/components/relativeHeading/Heading.svelte';
	import Section from '$lib/components/relativeHeading/Section.svelte';

	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<Page title="Panel">
	<Section>
		<Heading>
			{data.panel.id}
		</Heading>
	</Section>
</Page>
