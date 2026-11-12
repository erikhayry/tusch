<script lang="ts">
	import Page from '$lib/components/page/Page.svelte';
	import type { Data } from './+page';

	let { data }: { data: Data } = $props();
</script>

{#if data.comic}
	<Page title="Raw comic">
		<textarea>{JSON.stringify(data.comic, null, 2)}</textarea>
	</Page>
{/if}
