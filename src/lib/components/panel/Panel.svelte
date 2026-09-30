<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type PanelProps } from './panelTypes';

	let { number, totalNumberOfPanels }: PanelProps = $props();
</script>

<Section>
	<Heading>{m.panelTitle({ number, total: totalNumberOfPanels })}</Heading>
</Section>
