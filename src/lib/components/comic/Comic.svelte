<script lang="ts">
	import Character from '../charachter/Character.svelte';
	import PanelThumbnail from '../panel/PanelThumbnail.svelte';
	import Setting from '../setting/Setting.svelte';
	import { type ComicProps } from './comicTypes';

	let { comic }: ComicProps = $props();
</script>

<h2>{comic.title}</h2>

<h3>Settings</h3>

<h4>Source</h4>
<a target="_blank" href={comic.source}>{comic.source}</a>

<h4 id="characters">Characters</h4>
<ul aria-labelledby="characters">
	{#each comic.characters as character (character)}
		<li>
			<Character {character} />
		</li>
	{/each}
</ul>

<h4 id="panels">Panels</h4>
<ul aria-labelledby="panels">
	{#each comic.panels as panel (panel)}
		<li>
			<PanelThumbnail {panel} />
		</li>
	{/each}
</ul>

<h4>Setting</h4>
<Setting setting={comic.setting} />
