<script lang="ts">
	import Page from '$lib/components/page/Page.svelte';
	import Panels from '$lib/components/panels/Panels.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { Data } from './+page';

	let { data }: { data: Data } = $props();
</script>

{#if data.panel}
	<Page title={m.panel({ number: data.number })}>
		<Panels
			panels={data.panels}
			current={{ panel: data.panel, index: data.index }}
			comicId={data.comicId}
		/>
	</Page>
{/if}
