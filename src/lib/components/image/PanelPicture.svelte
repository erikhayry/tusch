<script lang="ts">
	import { opfsAssetStore } from '#lib/client/assets/opfs-asset-store.ts';
	import type { ResponsivePanelImage } from '#lib/types/index.ts';
	import Image from './Image.svelte';

	let { image, alt }: { image: ResponsivePanelImage; alt: string } = $props();

	let portraitUrl = $state<string | undefined>();
	let landscapeUrl = $state<string | undefined>();

	$effect(() => {
		const { portrait, landscape } = image;
		if (portrait && landscape) {
			opfsAssetStore.readUrl(portrait.src).then((url) => {
				portraitUrl = url;
			});
			opfsAssetStore.readUrl(landscape.src).then((url) => {
				landscapeUrl = url;
			});
		}
	});
</script>

{#if image.portrait && image.landscape}
	<!--
		The browser picks the file: landscape on a landscape screen, portrait otherwise
		(REQ-103-5). Printed pages are always portrait (REQ-89-4), so `screen` keeps print
		on the portrait file. The <img> is sized from the portrait file so the box is reserved.
	-->
	<picture>
		<source media="screen and (orientation: landscape)" srcset={landscapeUrl} />
		<img
			src={portraitUrl}
			width={image.portrait.width}
			height={image.portrait.height}
			{alt}
			class:pending={!portraitUrl}
		/>
	</picture>
{:else}
	<Image image={image.portrait ?? image.landscape} {alt} />
{/if}

<style>
	.pending {
		visibility: hidden;
	}
</style>
