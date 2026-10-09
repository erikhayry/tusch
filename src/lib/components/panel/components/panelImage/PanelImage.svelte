<script lang="ts">
	import type { Panel } from '$lib/types';
	import { getImageUrl } from '$lib/utils/storage/storage';
	import { getImageSrc } from '../../utils/image';

	let { panel, alt }: { panel: Panel; alt?: string } = $props();
	let imageSrc = $state<string | null>(null);

	$effect(() => {
		getImageUrl(getImageSrc(panel.image)).then((url) => {
			imageSrc = url;
		});
	});
</script>

{#if imageSrc}
	<img src={imageSrc} alt={alt || panel.image?.alt} />
{/if}
