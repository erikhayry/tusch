<script lang="ts">
	import Character from '../charachter/Character.svelte';
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
			{panel}
		</li>
	{/each}
</ul>

<h4 id="settings">Setting</h4>
<ul aria-labelledby="settings">
	{#each Object.values(comic.setting) as setting (setting)}
		<li>
			{setting}
		</li>
	{/each}
</ul>
