<script lang="ts">
	import Comic from '$lib/components/comic/Comic.svelte';
	import Page from '$lib/components/page/Page.svelte';

	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<Page title="Comic">
	<Comic comic={data.comic} />
</Page>
