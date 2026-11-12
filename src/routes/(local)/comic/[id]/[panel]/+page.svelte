<script lang="ts">
	import Page from '$lib/components/page/Page.svelte';
	import Panels from '$lib/components/panels/Panels.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { Props } from './+page';

	let { data }: { data: Props } = $props();
</script>

{#if data.panel}
	<Page title={m.panel({ number: data.number })}>
		<Panels
			panels={data.panels}
			current={{ panel: data.panel, index: data.index }}
			comicId={data.comicId}
			style={data.style}
			characters={data.characters}
		/>
	</Page>
{/if}
