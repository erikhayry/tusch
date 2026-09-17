<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<h1>Comics</h1>
<ul>
	{#each data.comics as comic (comic.id)}
		<li>
			<a href={resolve(`/comic/${comic.id}`)}>{comic.title}</a>
		</li>
	{/each}
</ul>
