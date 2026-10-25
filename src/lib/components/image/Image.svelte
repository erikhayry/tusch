<script lang="ts">
	import type { ImageAsset } from '$lib/types';
	import { getImageUrl } from '$lib/utils/storage/storage';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { getImageSrc } from '../panel/utils/image';

	type Props = SvelteHTMLElements['img'] & {
		image?: ImageAsset;
		alt: string;
	};

	let { image, alt, src: nativeSrc, ...imgAttributes }: Props = $props();
	let src = $state<string | null | undefined>(null);

	$effect(() => {
		if (image) {
			getImageUrl(getImageSrc(image)).then((url) => {
				src = url;
			});
		} else {
			src = nativeSrc;
		}
	});
</script>

{#if src}
	<img {...imgAttributes} {src} {alt} />
{/if}
