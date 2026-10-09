<script lang="ts">
	import { resolve } from '$app/paths';
	import Comic from '$lib/components/comic/Comic.svelte';
	import Page from '$lib/components/page/Page.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { Data } from './+page';

	let { data }: { data: Data } = $props();
</script>

<Page title={m.comicTitle({ title: data.comic.title })}>
	{#if data.comic}
		<Comic comic={data.comic} />
	{/if}
	<a href={resolve('/')}>{m.back()}</a>
</Page>
