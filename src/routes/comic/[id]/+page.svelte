<script lang="ts">
	import Comic from '$lib/components/comic/Comic.svelte';
	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<Comic comic={data.comic} />
