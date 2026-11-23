<script lang="ts">
	import { resolve } from '$app/paths';
	import { toCoverPrompt } from '#lib/features/comics/contracts/createCoverImage.ts';
	import { m } from '#lib/paraglide/messages.js';
	import {
		imageFormatOf,
		missingVariantFor,
		primaryVariant,
		storedVariants,
	} from '#lib/types/image-variants.ts';
	import type { ImageVariant } from '#lib/types/index.ts';
	import { DB_ITEM_TYPE, IMAGE_FORMAT_VALUE_KEY } from '#lib/utils/db/dbTypes.ts';
	import Character from '../charachter/Character.svelte';
	import CreateCoverImageForm from '../forms/createCoverImageForm/CreateCoverImageForm.svelte';
	import DeleteItemForm from '../forms/deleteItemForm/DeleteItemForm.svelte';
	import ImageFormatForm from '../forms/imageFormatForm/ImageFormatForm.svelte';
	import RemoveCoverVariantForm from '../forms/removeCoverVariantForm/RemoveCoverVariantForm.svelte';
	import Image from '../image/Image.svelte';
	import PanelThumbnail from '../panel/PanelThumbnail.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import Setting from '../setting/Setting.svelte';
	import { type ComicProps } from './comicTypes';

	let { comic }: ComicProps = $props();

	const imageFormat = $derived(imageFormatOf(comic));
	/** The variant the format asks for that the cover lacks (REQ-280-1). */
	const missingVariant = $derived(
		comic.cover ? missingVariantFor(comic.cover, imageFormat) : undefined,
	);

	const VARIANT_LABELS: Record<ImageVariant, () => string> = {
		portrait: () => m.portraitImage(),
		landscape: () => m.landscapeImage(),
	};
	const CREATE_LABELS: Record<ImageVariant, () => string> = {
		portrait: () => m.createPortraitCover(),
		landscape: () => m.createLandscapeCover(),
	};
	const REMOVE_LABELS: Record<ImageVariant, () => string> = {
		portrait: () => m.removePortraitCover(),
		landscape: () => m.removeLandscapeCover(),
	};
</script>

<!-- The page's <h1> already shows the comic title, so the sections start at h2. -->
<Section>
	<Heading>{m.settings()}</Heading>
	{#if comic.cover}
		{#each storedVariants(comic.cover) as { variant, asset } (variant)}
			<figure>
				<Image image={asset} alt={comic.cover.alt} fetchpriority="high" decoding="async" />
				<figcaption>{VARIANT_LABELS[variant]()}</figcaption>
			</figure>
		{/each}
		{#if missingVariant}
			<CreateCoverImageForm
				label={CREATE_LABELS[missingVariant]()}
				baseImage={primaryVariant(comic.cover)?.asset.src}
				values={{ comic: toCoverPrompt(comic), [IMAGE_FORMAT_VALUE_KEY]: missingVariant }}
			/>
		{/if}
		{#if storedVariants(comic.cover).length === 2}
			{#each storedVariants(comic.cover) as { variant } (variant)}
				<RemoveCoverVariantForm label={REMOVE_LABELS[variant]()} comicId={comic.id} {variant} />
			{/each}
		{:else}
			<DeleteItemForm
				label={m.deleteCover()}
				values={{
					comicId: comic.id,
					type: DB_ITEM_TYPE.enum.coverImage,
				}}
			/>
		{/if}
	{:else}
		<CreateCoverImageForm
			values={{ comic: toCoverPrompt(comic), [IMAGE_FORMAT_VALUE_KEY]: imageFormat }}
			label={m.addCover()}
		/>
	{/if}
	<ImageFormatForm comicId={comic.id} imageFormat={imageFormatOf(comic)} />
	<Section>
		<Heading>{m.comicStyle()}</Heading>
		<p>{comic.style}</p>

		<Heading>{m.source()}</Heading>
		{#if comic.source}
			<a target="_blank" rel="external" href={comic.source}>{comic.source}</a>
		{/if}
		{#if comic.story}
			<p class="story">{comic.story}</p>
		{/if}

		<Heading id="panels">{m.panels()}</Heading>
		<ul aria-labelledby="panels">
			{#each comic.panels as panel, index (panel)}
				<li>
					<a href={resolve(`comic/${comic.id}/${panel.id}`)}><PanelThumbnail {panel} /></a>

					<DeleteItemForm
						label={m.deletePanel({ number: index + 1 })}
						values={{
							comicId: comic.id,
							panelId: panel.id,
							type: DB_ITEM_TYPE.enum.panels,
						}}
					/>
				</li>
			{/each}
		</ul>

		{#if comic.characters}
			<Heading id="characters">{m.characters()}</Heading>
			<ul aria-labelledby="characters">
				<!-- Keyed by id: the store copies the character on every update, and an object key would remount the gallery and close its open crops. -->
				{#each comic.characters as character (character.id)}
					<li><Character {character} comicId={comic.id} /></li>
				{/each}
			</ul>
		{/if}

		{#if comic.setting}
			<Heading>{m.setting()}</Heading>
			<Setting setting={comic.setting} />
		{/if}
	</Section>
</Section>

<style>
	.story {
		white-space: pre-wrap;
	}
</style>
