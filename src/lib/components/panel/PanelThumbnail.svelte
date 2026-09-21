<script lang="ts">
	import { type PanelThumbnailProps } from './panelTypes';

	let { panel }: PanelThumbnailProps = $props();
</script>

<img src={panel.image.narrow.src} alt={panel.image.alt} />
