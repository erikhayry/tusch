<script lang="ts">
	import Page from '$lib/components/page/Page.svelte';
	import Panels from '$lib/components/panels/Panels.svelte';
	import { m } from '$lib/paraglide/messages';

	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<Page title={m.panel({ number: data.number })}>
	<Panels
		panels={data.panels}
		current={{ panel: data.panel, index: data.index }}
		comicId={data.comicId}
	/>
</Page>
