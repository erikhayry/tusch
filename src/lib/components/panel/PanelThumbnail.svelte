<script lang="ts">
	import { type PanelThumbnailProps } from './panelTypes';

	let { panel, alt }: PanelThumbnailProps = $props();
</script>

<img src={panel.image.narrow.src} {alt} />
