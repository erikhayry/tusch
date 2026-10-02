<script module lang="ts">
	export const comicsListId = 'comics';
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import Page from '$lib/components/page/Page.svelte';
	import Heading from '$lib/components/relativeHeading/Heading.svelte';
	import Section from '$lib/components/relativeHeading/Section.svelte';
	import RemoveFieldItemForm from '$lib/components/removeFieldItemForm/RemoveFieldItemForm.svelte';
	import { m } from '$lib/paraglide/messages';
	import { DB_ITEM_TYPE } from '$lib/utils/db/dbTypes';
	import type { Data } from './+page.server';

	let { data }: { data: Data } = $props();
</script>

<Page title={m.tusch()}>
	<Section>
		<Heading id={comicsListId}>{m.comics()}</Heading>
		<ul aria-labelledby={comicsListId}>
			{#each data.comics as comic (comic.id)}
				<li>
					<a href={resolve(`/comic/${comic.id}`)}>{comic.title}</a>
					<RemoveFieldItemForm
						values={{
							comicId: comic.id,
							type: DB_ITEM_TYPE.enum.comics,
						}}
						label={m.deleteComic({ title: comic.title })}
					/>
				</li>
			{/each}
		</ul>
	</Section>

	<a href={resolve('/comic/create')}>{m.createNewComic()}</a>
</Page>
