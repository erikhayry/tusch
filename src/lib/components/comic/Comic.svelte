<script lang="ts">
	import { type ComicProps } from './comicTypes';

	let { comic }: ComicProps = $props();
</script>

<h2>{comic.title}</h2>

<h3>Settings</h3>

<h4>Source</h4>
<a target="_blank" href={comic.script.source}>{comic.script.source}</a>

<h4 id="characters">Characters</h4>
<ul aria-labelledby="characters">
	{#each comic.script.characters as character (character)}
		<li>
			{character}
		</li>
	{/each}
</ul>

<h4 id="panels">Panels</h4>
<ul aria-labelledby="panels">
	{#each comic.script.panels as panel (panel)}
		<li>
			{panel}
		</li>
	{/each}
</ul>

<h4 id="settings">Setting</h4>
<ul aria-labelledby="settings">
	{#each Object.values(comic.script.setting) as setting (setting)}
		<li>
			{setting}
		</li>
	{/each}
</ul>
