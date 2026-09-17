<script lang="ts">
	import { type ComicProps } from './comicTypes';

	let { title, settings }: ComicProps = $props();
</script>

<h2>{title}</h2>

<h3>Settings</h3>

<h4>Source</h4>
<a target="_blank" href={settings.source}>{settings.source}</a>

<h4 id="characters">Characters</h4>
<ul aria-labelledby="characters">
	{#each settings.characters as character (character)}
		<li>
			{character}
		</li>
	{/each}
</ul>

<h4 id="panels">Panels</h4>
<ul aria-labelledby="panels">
	{#each settings.panels as panel (panel)}
		<li>
			{panel}
		</li>
	{/each}
</ul>

<h4 id="settings">Setting</h4>
<ul aria-labelledby="settings">
	{#each settings.setting as setting (setting)}
		<li>
			{setting}
		</li>
	{/each}
</ul>
