<script lang="ts">
	import Comic from '$lib/components/comic/Comic.svelte';
	import Page from '$lib/components/page/Page.svelte';
	import { m } from '$lib/paraglide/messages';

	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<Page title={m.comicTitle({ title: data.comic.title })}>
	<Comic comic={data.comic} />
</Page>
