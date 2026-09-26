<script lang="ts">
	import { resolve } from '$app/paths';
	import Page from '$lib/components/page/Page.svelte';
	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<Page title="Comics">
	<ul>
		{#each data.comics as comic (comic.id)}
			<li>
				<a href={resolve(`/comic/${comic.id}`)}>{comic.title}</a>
			</li>
		{/each}
	</ul>
</Page>
