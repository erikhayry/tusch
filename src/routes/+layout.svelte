<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import Header from '#lib/components/header/Header.svelte';
	import Error from '#lib/components/error/Error.svelte';
	import Loader from '#lib/components/loader/Loader.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// The viewer is a dark stage with its own header (REQ-299-1), so the shared one stays off it.
	const onReader = $derived(page.route.id === '/(local)/comic/[id]/view');

	// Signals that the app has mounted (and `use:enhance` is attached), so E2E
	// tests don't interact with server-rendered markup before hydration.
	$effect(() => {
		document.documentElement.dataset.hydrated = 'true';
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if !onReader}
	<Header />
{/if}
<Loader />
<Error />
{@render children()}
