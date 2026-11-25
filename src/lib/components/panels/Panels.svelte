<script lang="ts">
	import { resolve } from '$app/paths';
	import { toCreatePanelValues } from '#lib/features/panels/contracts/createPanel.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { primaryVariant } from '#lib/types/image-variants.ts';
	import { MediaQuery } from 'svelte/reactivity';
	import Breadcrumb from '../breadcrumb/Breadcrumb.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import Image from '../image/Image.svelte';
	import CreatePanelForm from '../forms/createPanelForm/CreatePanelForm.svelte';
	import Panel from '../panel/Panel.svelte';
	import Section from '../relativeHeading/Section.svelte';
	import { type PanelsProps } from './panelsTypes';

	let { panels, comicId, comicTitle, current, style, characters }: PanelsProps = $props();

	// Matches the project's one breakpoint (styling.md). Read in script because the
	// Prev/Next text differs by width: the glyph alone from 48em, the word below it.
	const wide = new MediaQuery('min-width: 48em');

	let cardList: HTMLOListElement | undefined = $state();

	const previous = $derived(current.index > 0 ? panels[current.index - 1] : undefined);
	const next = $derived(current.index < panels.length - 1 ? panels[current.index + 1] : undefined);

	function panelHref(panelId: string) {
		return resolve(`comic/${comicId}/${panelId}`);
	}

	// Removing this panel leaves the previous one, else the next one, else the comic.
	const afterDeletePanelId = $derived(previous?.id ?? next?.id);

	// Browsers don't scroll a focused element that is already partly visible, so a card
	// cut off at an edge would stay cut off when reached with Tab.
	function revealFocused(event: FocusEvent) {
		if (event.target instanceof HTMLElement) {
			event.target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		}
	}

	$effect(() => {
		// Reading the index makes the effect run again when the user moves to another panel.
		const currentCard = cardList?.children.item(current.index);
		// `nearest` keeps the page from jumping; only the list scrolls sideways.
		currentCard?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	});
</script>

<Section>
	<!-- Names the list. Visually hidden: the page keeps a heading level between the title and the panel. -->
	<Heading id="panels-heading" class="sr-only">{m.panels()}</Heading>
	<div class="chrome">
		<div class="bar">
			<a class="back" href={resolve(`comic/${comicId}`)} aria-label={m.backToComic()}>
				<span aria-hidden="true">←</span>
			</a>
			<div class="crumbs">
				<Breadcrumb {comicId} {comicTitle} panelNumber={current.index + 1} />
			</div>
			<a class="read" href={resolve(`comic/${comicId}/view`)} aria-label={m.readThisComic()}>
				{m.read()}
			</a>
		</div>

		<div class="strip">
			{#if previous}
				<a class="step step-prev" href={panelHref(previous.id)} aria-label={m.previousPanel()}>
					{#if wide.current}
						<span aria-hidden="true">‹</span>
					{:else}
						<span aria-hidden="true">←</span> {m.previousPanel()}
					{/if}
				</a>
			{:else}
				<span class="step step-prev" aria-disabled="true">
					{#if wide.current}
						<span aria-hidden="true">‹</span><span class="sr-only">{m.previousPanel()}</span>
					{:else}
						<span aria-hidden="true">←</span> {m.previousPanel()}
					{/if}
				</span>
			{/if}

			<ol
				class="cards"
				aria-labelledby="panels-heading"
				bind:this={cardList}
				onfocusin={revealFocused}
			>
				{#each panels as panel, index (panel.id)}
					<li class="card">
						<!-- "Before panel 1" comes first; each card is followed by "after panel N". -->
						{#if index === 0}
							<CreatePanelForm
								values={toCreatePanelValues(comicId, panels, 0)}
								label={m.addPanelBefore({ number: 1 })}
							/>
						{/if}
						<a
							class="card-link"
							href={panelHref(panel.id)}
							aria-current={index === current.index ? 'page' : undefined}
						>
							<span class="thumb">
								{#if panel.image}
									<!-- The title names the link, so the image is decorative. -->
									<Image
										image={primaryVariant(panel.image)?.asset}
										alt=""
										loading="lazy"
										decoding="async"
									/>
								{:else}
									<span class="placeholder" aria-hidden="true"></span>
								{/if}
							</span>
							{m.panel({ number: index + 1 })}{panel.editorialTitle
								? ` ${panel.editorialTitle}`
								: ''}
						</a>
						<CreatePanelForm
							values={toCreatePanelValues(comicId, panels, index + 1)}
							label={m.addPanelAfter({ number: index + 1 })}
						/>
					</li>
				{/each}
			</ol>

			{#if next}
				<a class="step step-next" href={panelHref(next.id)} aria-label={m.nextPanel()}>
					{#if wide.current}
						<span aria-hidden="true">›</span>
					{:else}
						{m.nextPanel()} <span aria-hidden="true">→</span>
					{/if}
				</a>
			{:else}
				<span class="step step-next" aria-disabled="true">
					{#if wide.current}
						<span aria-hidden="true">›</span><span class="sr-only">{m.nextPanel()}</span>
					{:else}
						{m.nextPanel()} <span aria-hidden="true">→</span>
					{/if}
				</span>
			{/if}
		</div>
	</div>

	<Panel
		panel={current.panel}
		{comicId}
		totalNumberOfPanels={panels.length}
		number={current.index + 1}
		{style}
		{characters}
		{afterDeletePanelId}
	/>
</Section>

<style>
	/* Below 48em the bar and the list stay at the top while the panel scrolls under them. */
	.chrome {
		position: sticky;
		inset-block-start: 0;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-block: var(--space-2);
		background: var(--color-background);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	.back,
	.read {
		display: inline-flex;
		align-items: center;
		min-block-size: var(--control-min-size);
	}

	.back {
		justify-content: center;
		min-inline-size: var(--control-min-size);
	}

	.read {
		margin-inline-start: auto;
	}

	.crumbs {
		display: none;
		min-inline-size: 0;
	}

	/* Each crumb is a 44px target (REQ-323) without making the row taller than one line. */
	.crumbs :global(.label) {
		display: inline-flex;
		align-items: center;
		min-block-size: var(--control-min-size);
		margin-block: var(--crumb-tap-offset);
	}

	/* Prev and Next sit at the two ends of the list. */
	.strip {
		display: flex;
		align-items: stretch;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.step {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		min-inline-size: var(--control-min-size);
		min-block-size: var(--control-min-size);
	}

	.step[aria-disabled='true'] {
		color: var(--color-muted);
	}

	/* Below 48em Prev and Next are pinned to the bottom of the viewport, out of the row. */
	.step-prev,
	.step-next {
		position: fixed;
		inset-block-end: 0;
		z-index: 2;
		padding-inline: var(--space-3);
		background: var(--color-background);
		border-block-start: var(--border-width) solid var(--color-border);
	}

	.step-prev {
		inset-inline-start: 0;
	}

	.step-next {
		inset-inline-end: 0;
	}

	:global(#panels-heading) {
		position: absolute;
		inline-size: var(--visually-hidden-size);
		block-size: var(--visually-hidden-size);
		overflow: hidden;
		clip-path: var(--visually-hidden-clip);
		white-space: nowrap;
	}

	.sr-only {
		position: absolute;
		inline-size: var(--visually-hidden-size);
		block-size: var(--visually-hidden-size);
		overflow: hidden;
		clip-path: var(--visually-hidden-clip);
		white-space: nowrap;
	}

	/* One row that scrolls inside its own box. The padding keeps the focus outline
	   (3px + 2px offset) from being clipped by the scroll box. scroll-padding makes
	   the browser scroll a card that is only partly visible at an edge, so a focused
	   card is never half hidden. */
	.cards {
		display: flex;
		flex: 1 1 auto;
		align-items: stretch;
		gap: var(--space-2);
		min-inline-size: 0;
		margin: 0;
		padding: var(--space-2);
		overflow-x: auto;
		scroll-padding-inline: var(--space-5);
		list-style: none;
	}

	/* The card, and the "+" buttons either side of it (see CreatePanelForm). */
	.card {
		display: flex;
		flex: none;
		align-items: stretch;
		min-inline-size: 0;
	}

	.card-link {
		display: flex;
		flex: none;
		flex-direction: column;
		gap: var(--space-1);
		inline-size: var(--panel-card-width);
		padding: var(--space-1);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--radius);
	}

	/* A ring instead of a thicker border: the border would shrink the content box, so
	   the current card's thumbnail would no longer match the others'. */
	.card-link[aria-current='page'] {
		border-color: var(--color-text);
		box-shadow: 0 0 0 calc(var(--border-width-thick) - var(--border-width)) var(--color-text);
	}

	/* 2:3 box for both the image and the placeholder, so cards line up. */
	.thumb {
		display: block;
		inline-size: 100%;
		aspect-ratio: 2 / 3;
		overflow: hidden;
		background: var(--color-surface);
		border-radius: var(--radius);
	}

	/* The image is rendered by Image.svelte, so it's styled from here via :global. */
	.thumb :global(img) {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.placeholder {
		display: block;
		block-size: 100%;
	}

	@media (min-width: 48em) {
		.chrome {
			position: static;
			padding-block: 0;
			background: none;
		}

		.crumbs {
			display: block;
		}

		.back {
			display: none;
		}

		.strip {
			align-items: center;
		}

		.step {
			position: static;
			padding-inline: 0;
			background: none;
			border: 0;
		}
	}
</style>
