<script lang="ts">
	import { resolve } from '$app/paths';
	import Section from '$lib/components/relativeHeading/Section.svelte';
	import { m } from '$lib/paraglide/messages';
	import Panel from '../panel/Panel.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import { type PanelsProps } from './panelsTypes';

	let { panels, comicId, current }: PanelsProps = $props();
</script>

<Section>
	<aside>
		<Heading id="panels-heading">{m.panels()}</Heading>
		<ol aria-labelledby="panels-heading">
			{#each panels as panel, index (panel.id)}
				<li>
					<a
						href={resolve(`/comic/${comicId}/${panel.id}`)}
						aria-current={index === current.index ? 'page' : undefined}
						>{m.panel({ number: index + 1 })}</a
					>
				</li>
			{/each}
		</ol>
	</aside>
	<Panel
		panel={current.panel}
		{comicId}
		totalNumberOfPanels={panels.length}
		number={current.index + 1}
	/>
	<a href={resolve(`/comic/${comicId}`)}>{m.backToComic()}</a>
</Section>
