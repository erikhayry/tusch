<script lang="ts">
	import { primaryVariant } from '#lib/types/image-variants.ts';
	import Image from '../image/Image.svelte';
	import { type PanelThumbnailProps } from './panelTypes';

	let { panel }: PanelThumbnailProps = $props();
</script>

{#if panel.image}
	<Image
		image={primaryVariant(panel.image)?.asset}
		alt={panel.editorialTitle}
		loading="lazy"
		decoding="async"
	/>
{:else}
	{panel.editorialTitle || '??'}
{/if}
