<script lang="ts">
	import Comic from '$lib/components/comic/Comic.svelte';
	import { type Comic as ComicType } from '$lib/types';

	let { data }: { data: { comic: ComicType } } = $props();
</script>

<Comic comic={data.comic} />
