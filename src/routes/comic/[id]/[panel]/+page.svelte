<script lang="ts">
	import Page from '$lib/components/page/Page.svelte';
	import Panel from '$lib/components/panel/Panel.svelte';

	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<Page title="Panel">
	<Panel panel={data.panel} number={data.number} totalNumberOfPanels={data.totalNumberOfPanels} />
</Page>
