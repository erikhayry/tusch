<script lang="ts">
	import { resolve } from '$app/paths';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { toCreatePanelValues } from '#lib/features/panels/contracts/createPanel.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { primaryVariant } from '#lib/types/image-variants.ts';
	import Image from '../image/Image.svelte';
	import CreatePanelForm from '../forms/createPanelForm/CreatePanelForm.svelte';
	import Panel from '../panel/Panel.svelte';
	import Heading from '../relativeHeading/Heading.svelte';
	import { type PanelsProps } from './panelsTypes';

	let { panels, comicId, current, style, characters }: PanelsProps = $props();

	let cardList: HTMLOListElement | undefined = $state();

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
	<aside>
		<Heading id="panels-heading">{m.panels()}</Heading>
		<ol
			aria-labelledby="panels-heading"
			class="cards"
			bind:this={cardList}
			onfocusin={revealFocused}
		>
			{#each panels as panel, index (panel.id)}
				<li class="card">
					<a
						class="card-link"
						href={resolve(`comic/${comicId}/${panel.id}`)}
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
						{panel.editorialTitle || m.panel({ number: index + 1 })}
					</a>
					<!-- "After panel N" is the insertion index N (0-based array index of the new panel). -->
					{#if index === 0}
						<CreatePanelForm
							values={toCreatePanelValues(comicId, panels, 0)}
							label={m.addPanelBefore({ number: 1 })}
						/>
					{/if}
					<CreatePanelForm
						values={toCreatePanelValues(comicId, panels, index + 1)}
						label={m.addPanelAfter({ number: index + 1 })}
					/>
				</li>
			{/each}
		</ol>
	</aside>
	<Panel
		panel={current.panel}
		{comicId}
		totalNumberOfPanels={panels.length}
		number={current.index + 1}
		{style}
		{characters}
	/>
	<a href={resolve(`comic/${comicId}`)}>{m.backToComic()}</a>
</Section>

<style>
	/* One row that scrolls inside its own box. The padding keeps the focus outline
	   (3px + 2px offset) from being clipped by the scroll box. scroll-padding makes
	   the browser scroll a card that is only partly visible at an edge, so a focused
	   card is never half hidden. */
	.cards {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-2);
		overflow-x: auto;
		scroll-padding-inline: var(--space-5);
		list-style: none;
	}

	.card {
		display: flex;
		flex: 0 0 var(--panel-card-width);
		flex-direction: column;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.card-link {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
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
</style>
