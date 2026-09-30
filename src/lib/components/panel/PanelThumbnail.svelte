<script lang="ts">
	import { type PanelThumbnailProps } from './panelTypes';

	let { panel, alt }: PanelThumbnailProps = $props();
</script>

{#if panel.image}
	<img src={panel.image.narrow.src} {alt} />
{:else}
	{panel.id}
{/if}
