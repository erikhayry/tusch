<script lang="ts">
	import { opfsAssetStore } from '#lib/client/assets/opfs-asset-store.ts';
	import { ImageAssetSchema } from '#lib/types/index.ts';
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

{#if imageData.image || src}
	<!--
		Mounted before the OPFS URL resolves and sized from the stored asset, so the
		box is reserved and the page doesn't shift when the image appears (CLS).
		Hidden until it has a src, so its alt text doesn't flash.
	-->
	<img
		{...imgAttributes}
		src={src ?? undefined}
		width={imageData.image?.width}
		height={imageData.image?.height}
		alt={imageData.alt}
		class:pending={!src}
	/>
{/if}

<style>
	.pending {
		visibility: hidden;
	}
</style>
