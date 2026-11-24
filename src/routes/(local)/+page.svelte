<script module lang="ts">
	export const comicsListId = 'comics';
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import DeleteItemForm from '#lib/components/forms/deleteItemForm/DeleteItemForm.svelte';
	import LoginForm from '#lib/components/forms/loginForm/LoginForm.svelte';
	import Image from '#lib/components/image/Image.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import Heading from '#lib/components/relativeHeading/Heading.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { comicMetaLine } from '#lib/features/comics/client/comic-selectors.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { primaryVariant } from '#lib/types/image-variants.ts';
	import { DB_ITEM_TYPE } from '#lib/utils/db/dbTypes.ts';
	import type { Props } from './+page.ts';

	// The first four covers in the grid load eagerly; the rest lazily, so the first paint
	// isn't held up by covers below the fold (REQ-039, REQ-235-3).
	const EAGER_COVERS = 4;

	let { data }: { data: Props } = $props();

	const eagerCoverIds = $derived(
		new Set(
			data.comics
				.filter((comic) => primaryVariant(comic.cover))
				.slice(0, EAGER_COVERS)
				.map((comic) => comic.id),
		),
	);
</script>

<Page title={m.tusch()}>
	{#if data.showWelcome}
		<div class="welcome-card">
			<Section>
				<Heading>{m.welcomeHeading()}</Heading>
				<p>{m.welcomeSentence()}</p>
				<LoginForm hasKey={data.hasKey} />
			</Section>
		</div>
	{/if}

	<Section>
		<div class="library-heading">
			<Heading id={comicsListId}>{m.yourComics()}</Heading>
			<span class="count">{data.comics.length}</span>
		</div>
		<ul class="comics" aria-labelledby={comicsListId}>
			{#each data.comics as comic (comic.id)}
				{@const cover = primaryVariant(comic.cover)}
				<li class="card">
					<div class="cover">
						{#if cover}
							<!-- The cover is decorative: the title and the Read and Edit links name the comic. -->
							<Image
								image={cover.asset}
								alt=""
								loading={eagerCoverIds.has(comic.id) ? 'eager' : 'lazy'}
								decoding="async"
							/>
						{:else}
							<span class="no-cover">{m.noCoverYet()}</span>
						{/if}
					</div>
					<p class="title">{comic.title}</p>
					<p class="meta">{comicMetaLine(comic)}</p>
					<div class="actions">
						<a
							class="action"
							href={resolve(`comic/${comic.id}/view`)}
							aria-label={m.readComic({ title: comic.title })}>{m.read()}</a
						>
						<a
							class="action"
							href={resolve(`comic/${comic.id}`)}
							aria-label={m.editComic({ title: comic.title })}>{m.edit()}</a
						>
						<DeleteItemForm
							values={{
								comicId: comic.id,
								type: DB_ITEM_TYPE.enum.comics,
							}}
							label={m.deleteComic({ title: comic.title })}
							iconOnly
						/>
					</div>
				</li>
			{/each}
			<li class="card tile">
				<a class="tile-link" href={resolve('comic/create')}>
					<span class="tile-title">{m.createNewComic()}</span>
					<span class="tile-hint">{m.createComicTileHint()}</span>
				</a>
			</li>
		</ul>
	</Section>
</Page>

<style>
	.welcome-card {
		padding: var(--space-3);
		background: var(--color-surface);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--card-radius);
	}

	.library-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
	}

	.count {
		color: var(--color-muted);
	}

	.comics {
		list-style: none;
		padding-inline-start: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(var(--card-min-width), 1fr));
		gap: var(--space-3);
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-inline-size: 0;
		padding: var(--space-2);
		background: var(--color-surface);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--card-radius);
	}

	.cover {
		aspect-ratio: var(--card-cover-aspect-ratio);
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--color-background);
	}

	.cover :global(img) {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.no-cover {
		display: flex;
		align-items: center;
		justify-content: center;
		block-size: 100%;
		padding: var(--space-2);
		color: var(--color-muted);
		text-align: center;
	}

	.title {
		margin: 0;
		font-weight: var(--font-weight-semibold);
		overflow-wrap: anywhere;
	}

	.meta {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin-block-start: auto;
	}

	.action {
		display: inline-flex;
		align-items: center;
		min-block-size: var(--control-min-size);
		padding-inline: var(--space-3);
		border: var(--border-width) solid var(--color-control-border);
		border-radius: var(--radius);
		color: var(--color-link);
		text-decoration: none;
	}

	.tile {
		border-style: dashed;
	}

	.tile-link {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-2);
		block-size: 100%;
		min-block-size: var(--tile-min-height);
		color: var(--color-text);
		text-decoration: none;
	}

	.tile-title {
		font-weight: var(--font-weight-semibold);
		text-decoration: underline;
	}

	.tile-hint {
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
</style>
