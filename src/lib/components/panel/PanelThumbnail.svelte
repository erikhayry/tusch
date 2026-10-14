<script lang="ts">
	import Image from '../image/Image.svelte';
	import { type PanelThumbnailProps } from './panelTypes';

	let { panel, alt }: PanelThumbnailProps = $props();
</script>

{#if panel.image}
	<Image image={panel.image} {alt} />
{:else}
	{panel.id}
{/if}
