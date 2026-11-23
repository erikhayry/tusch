<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { Snippet } from 'svelte';

	// A page that places its own <h1> (the viewer sets it over the cover) turns the default off.
	let {
		title,
		showTitle = true,
		children,
	}: { title: string; showTitle?: boolean; children: Snippet } = $props();

	const documentTitle = $derived(title === m.tusch() ? title : `${title} · ${m.tusch()}`);
</script>

<svelte:head><title>{documentTitle}</title></svelte:head>

<main>
	{#if showTitle}
		<h1>{title}</h1>
	{/if}
	{@render children()}
</main>
