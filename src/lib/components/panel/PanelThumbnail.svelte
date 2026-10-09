<script lang="ts">
	import PanelImage from './components/panelImage/PanelImage.svelte';
	import { type PanelThumbnailProps } from './panelTypes';

	let { panel, alt }: PanelThumbnailProps = $props();
</script>

{#if panel.image}
	<PanelImage {panel} {alt} />
{:else}
	{panel.id}
{/if}
