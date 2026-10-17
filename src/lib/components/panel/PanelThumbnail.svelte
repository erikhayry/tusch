<script lang="ts">
	import Image from '../image/Image.svelte';
	import { type PanelThumbnailProps } from './panelTypes';

	let { panel }: PanelThumbnailProps = $props();
</script>

{#if panel.image}
	<Image image={panel.image} alt={panel.editorialTitle} />
{:else}
	{panel.editorialTitle || '??'}
{/if}
