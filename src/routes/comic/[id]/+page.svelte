<script lang="ts">
	import { type Comic } from '$lib/types';

	let { data }: { data: { comic: Comic } } = $props();
</script>

<h1>{data.comic.title}</h1>
