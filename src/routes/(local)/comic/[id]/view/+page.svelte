<script lang="ts">
	import { resolve } from '$app/paths';
	import Image from '#lib/components/image/Image.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import Heading from '#lib/components/relativeHeading/Heading.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { Data } from '../+page';

	let { data }: { data: Data } = $props();
</script>

<Page title={data.comic.title.trim() || m.untitledComic()}>
	{#if data.comic.cover}
		<Image image={data.comic.cover.landscape} alt={data.comic.cover.alt} />
	{/if}

	{#each data.comic.panels as panel, index (panel.id)}
		<Section>
			<Heading>{m.panel({ number: index + 1 })}</Heading>
			{#if panel.image}
				<Image image={panel.image.landscape} alt={panel.image.alt} />
			{/if}
			{#if panel.captions.length > 0}
				<ul>
					{#each panel.captions as caption, captionIndex (captionIndex)}
						<li>{caption}</li>
					{/each}
				</ul>
			{/if}
			{#if panel.dialogue.length > 0}
				<ul>
					{#each panel.dialogue as line, lineIndex (lineIndex)}
						{@const name = data.comic.characters.find(({ id }) => id === line.characterId)?.name}
						<li>{name ? `${name}: ${line.text}` : line.text}</li>
					{/each}
				</ul>
			{/if}
		</Section>
	{/each}

	<a href={resolve(`comic/${data.comic.id}`)}>{m.back()}</a>
</Page>
