<script lang="ts">
	import { opfsAssetStore } from '$lib/client/assets/opfs-asset-store';
	import { ImageAssetSchema } from '$lib/types';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { z } from 'zod';
	import { getImageSrc } from '../panel/utils/image';

	const ImageDataPropsSchema = z.object({
		image: ImageAssetSchema.optional(),
		alt: z.string(),
	});
	type ImageDataProps = z.infer<typeof ImageDataPropsSchema>;
	type Props = SvelteHTMLElements['img'] & ImageDataProps;

	let { image, alt, src: nativeSrc, ...imgAttributes }: Props = $props();
	const imageData = $derived(ImageDataPropsSchema.parse({ image, alt }));
	let src = $state<string | null | undefined>(null);

	$effect(() => {
		if (imageData.image) {
			opfsAssetStore.readUrl(getImageSrc(imageData.image)).then((url) => {
				src = url;
			});
		} else {
			src = nativeSrc;
		}
	});
</script>

{#if src}
	<img {...imgAttributes} {src} alt={imageData.alt} />
{/if}
