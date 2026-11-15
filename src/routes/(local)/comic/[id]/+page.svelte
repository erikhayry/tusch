<script lang="ts">
	import { resolve } from '$app/paths';
	import Comic from '$lib/components/comic/Comic.svelte';
	import Page from '$lib/components/page/Page.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { Data } from './+page';

	let { data }: { data: Data } = $props();
</script>

<Page title={data.comic.title.trim() || m.untitledComic()}>
	{#if data.comic}
		<a href={resolve(`/comic/${data.comic.id}/view`)}>{m.viewComic()}</a>
		<Comic comic={data.comic} />
	{/if}
	<a href={resolve('/')}>{m.back()}</a>
</Page>
