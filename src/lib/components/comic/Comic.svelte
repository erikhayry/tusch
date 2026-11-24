<script lang="ts">
	import { resolve } from '$app/paths';
	import { toCoverPrompt } from '#lib/features/comics/contracts/createCoverImage.ts';
	import { panelCountsLine } from '#lib/features/comics/client/comic-selectors.ts';
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

<!--
	Four cards (three without characters), each a Section so its <h2> is one level under the
	page's <h1>. On wide screens the left column holds Panels and Characters, the right one
	Cover and Comic settings; below the breakpoint the columns stack in this same DOM order.
-->
<div class="overview">
	<div class="column">
		<div class="card">
			<Section>
				<Heading id="panels">{m.panels()}</Heading>
				<!-- Only one hint is shown per width; the other is display: none, so it isn't read. -->
				<ul class="strip" aria-labelledby="panels">
					{#each comic.panels as panel, index (panel)}
						{@const panelLine = panelCountsLine(panel)}
						<li class="panel">
							<a
								class="frame"
								href={resolve(`comic/${comic.id}/${panel.id}`)}
								aria-label={panel.editorialTitle}
							>
								<PanelThumbnail {panel} />
							</a>
							<div class="details">
								<p class="title"><span class="number">{index + 1}</span> {panel.editorialTitle}</p>
								{#if panelLine}
									<p class="meta">{panelLine}</p>
								{/if}
								<DeleteItemForm
									iconOnly
									label={m.deletePanel({ number: index + 1 })}
									values={{
										comicId: comic.id,
										panelId: panel.id,
										type: DB_ITEM_TYPE.enum.panels,
									}}
								/>
							</div>
						</li>
					{/each}
				</ul>
				<p class="hint hint-narrow">{m.panelStripHintNarrow()}</p>
				<p class="hint hint-wide">{m.panelStripHint()}</p>
			</Section>
		</div>

		<!-- Omitted without characters: an empty card would only say there is nothing to show. -->
		{#if comic.characters.length > 0}
			<div class="card">
				<Section>
					<Heading id="characters">{m.characters()}</Heading>
					<ul aria-labelledby="characters">
						<!-- Keyed by id: the store copies the character on every update, and an object key would remount the gallery and close its open crops. -->
						{#each comic.characters as character (character.id)}
							<li><Character {character} comicId={comic.id} /></li>
						{/each}
					</ul>
				</Section>
			</div>
		{/if}
	</div>

	<div class="column">
		<div class="card">
			<Section>
				<Heading>{m.cover()}</Heading>
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
							<RemoveCoverVariantForm
								label={REMOVE_LABELS[variant]()}
								comicId={comic.id}
								{variant}
							/>
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
			</Section>
		</div>

		<div class="card">
			<Section>
				<Heading>{m.comicSettings()}</Heading>
				<ImageFormatForm comicId={comic.id} imageFormat={imageFormatOf(comic)} />
				<dl class="facts">
					<dt>{m.comicStyle()}</dt>
					<dd>{comic.style}</dd>

					<dt>{m.source()}</dt>
					<dd>
						{#if comic.source}
							<a target="_blank" rel="external" href={comic.source}>{comic.source}</a>
						{/if}
						{#if comic.story}
							<p class="story">{comic.story}</p>
						{/if}
					</dd>
				</dl>

				{#if comic.setting}
					<Heading>{m.setting()}</Heading>
					<Setting setting={comic.setting} />
				{/if}
			</Section>
		</div>
	</div>
</div>

<style>
	.overview {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	.column {
		display: grid;
		align-content: start;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	.card {
		min-inline-size: 0;
		padding: var(--space-3);
		background: var(--color-surface);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--card-radius);
	}

	/* The card's own padding already separates the heading from its edge. */
	.card :global(h2:first-child) {
		margin-block-start: 0;
	}

	.strip {
		display: flex;
		gap: var(--space-3);
		margin: 0;
		padding: var(--space-2);
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		list-style: none;
	}

	.panel {
		display: flex;
		flex: 0 0 var(--strip-card-width-narrow);
		flex-direction: column;
		gap: var(--space-2);
		min-inline-size: 0;
		scroll-snap-align: start;
	}

	.frame {
		display: block;
		aspect-ratio: var(--card-cover-aspect-ratio);
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--color-background);
	}

	.frame :global(img) {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.details {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.details :global(form) {
		margin: 0;
	}

	.details :global(button) {
		margin: 0;
	}

	.title {
		margin: 0;
		font-weight: var(--font-weight-semibold);
		overflow-wrap: anywhere;
	}

	.number {
		color: var(--color-muted);
	}

	.meta,
	.hint {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}

	.hint {
		margin-block-start: var(--space-2);
	}

	.hint-wide {
		display: none;
	}

	.facts {
		margin: 0;
	}

	.facts dt {
		font-weight: var(--font-weight-semibold);
	}

	.facts dd {
		margin: 0 0 var(--space-3);
	}

	.story {
		white-space: pre-wrap;
	}

	/* Wide screens: two columns; the panel strip's cards get larger. */
	@media (min-width: 48em) {
		.overview {
			grid-template-columns: minmax(0, 1fr) var(--overview-side-column);
			align-items: start;
			gap: var(--space-4);
		}

		.panel {
			flex-basis: var(--strip-card-width-wide);
		}

		.hint-narrow {
			display: none;
		}

		.hint-wide {
			display: block;
		}
	}
</style>
