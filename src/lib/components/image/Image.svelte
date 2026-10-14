<script lang="ts">
	import type { Comic } from '$lib/types';
	import { getImageUrl } from '$lib/utils/storage/storage';
	import { getImageSrc } from '../panel/utils/image';

	let { image, alt }: { image: Comic['cover']; alt?: string } = $props();
	let imageSrc = $state<string | null>(null);

	$effect(() => {
		getImageUrl(getImageSrc(image)).then((url) => {
			imageSrc = url;
		});
	});
</script>

{#if imageSrc && image}
	<img src={imageSrc} alt={alt ?? image.alt} />
{/if}
