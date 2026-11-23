<script module lang="ts">
	export const comicsListId = 'comics';
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import DeleteItemForm from '#lib/components/forms/deleteItemForm/DeleteItemForm.svelte';
	import LoginForm from '#lib/components/forms/loginForm/LoginForm.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import Heading from '#lib/components/relativeHeading/Heading.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import Image from '#lib/components/image/Image.svelte';
	import { DB_ITEM_TYPE } from '#lib/utils/db/dbTypes.ts';
	import type { Props } from './+page.ts';

	// Covers in the first row (three per row from the 48em breakpoint) load eagerly; the rest lazily,
	// so the landing page's first paint isn't held up by images below the fold (REQ-039).
	const EAGER_COVERS = 3;

	let { data }: { data: Props } = $props();
</script>

<Page title={m.tusch()}>
	{#if data.showWelcome}
		<Section>
			<Heading>{m.welcomeHeading()}</Heading>
			<p>{m.welcomeSentence()}</p>
			<LoginForm hasKey={data.hasKey} />
		</Section>
	{/if}

	<Section>
		<Heading id={comicsListId}>{m.comics()}</Heading>
		<ul class="comics" aria-labelledby={comicsListId}>
			{#each data.comics as comic, index (comic.id)}
				<li class="comic">
					<!-- The cover is decorative: the link's name stays the title. The delete button sits outside the link. -->

					<a class="comic-link" href={resolve(`comic/${comic.id}`)}>
						{#if comic.cover}
							<Image
								image={comic.cover.portrait}
								alt=""
								loading={index < EAGER_COVERS ? 'eager' : 'lazy'}
								decoding="async"
							/>
						{:else}
							<!-- Empty and hidden from assistive tech: it only reserves a cover's height so titles line up in a row. -->
							<span class="cover-spacer" aria-hidden="true"></span>
						{/if}
						<span class="title">{comic.title}</span>
					</a>
					<DeleteItemForm
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

	<p><a href={resolve('comic/create')}>{m.createNewComic()}</a></p>
	<p><a href={resolve('settings')}>{m.settings()}</a></p>
</Page>

<style>
	.comics {
		list-style: none;
		padding-inline-start: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-3);
	}

	.comic {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.comic-link {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		inline-size: 100%;
		text-decoration: none;
	}

	.cover-spacer {
		display: block;
		inline-size: 100%;
		aspect-ratio: var(--cover-aspect-ratio);
	}

	.title {
		text-decoration: underline;
	}

	@media (min-width: 48em) {
		.comics {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
