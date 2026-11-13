<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();

	const documentTitle = $derived(title === m.tusch() ? title : `${title} · ${m.tusch()}`);
</script>

<svelte:head><title>{documentTitle}</title></svelte:head>

<main>
	<h1>{title}</h1>
	{@render children()}
</main>
