<script lang="ts">
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import Character from '../charachter/Character.svelte';
	import PanelThumbnail from '../panel/PanelThumbnail.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import Setting from '../setting/Setting.svelte';
	import { type ComicProps } from './comicTypes';

	let { comic }: ComicProps = $props();
</script>

<Section>
	<Heading>{comic.title}</Heading>
	<Section>
		<Heading>Settings</Heading>
		<Section>
			<Heading>Source</Heading>
			<a target="_blank" rel="external" href={comic.source}>{comic.source}</a>

			<Heading id="characters">{m.characters()}</Heading>
			<ul aria-labelledby="characters">
				{#each comic.characters as character (character)}
					<li>
						<Character {character} />
					</li>
				{/each}
			</ul>

			<Heading id="panels">{m.panels()}</Heading>
			<ul aria-labelledby="panels">
				{#each comic.panels as panel (panel)}
					<li>
						<a href={resolve(`/comic/${comic.id}/${panel.id}`)}>
							<PanelThumbnail {panel} alt={panel.id} />
						</a>
					</li>
				{/each}
			</ul>

			<Heading>{m.setting()}</Heading>
			<Setting setting={comic.setting} />
		</Section>
	</Section>
</Section>
