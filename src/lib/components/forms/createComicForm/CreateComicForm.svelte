<script lang="ts" module>
	export const createComicFormTestId = 'createcomicform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { localizedHref } from '#lib/components/header/header-navigation.ts';
	import FieldError from '#lib/components/fieldError/FieldError.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { expectWorkflow } from '#lib/features/comics/client/workflows/asset-workflow.ts';
	import { commitGeneratedComic } from '#lib/features/comics/client/workflows/commit-generated-comic.ts';
	import {
		CREATE_COMIC_ACTION,
		PANEL_COUNT_DEFAULT,
		PANEL_COUNT_MAX,
		PANEL_COUNT_MIN,
		STORY_MAX_LENGTH,
		type CreateComicResult,
	} from '#lib/features/comics/contracts/createComic.ts';
	import { withGlobalInstructions } from '#lib/features/settings/client/global-instructions.ts';
	import { enhanceAction } from '#lib/forms/enhance-action.ts';
	import type { FieldMessages } from '#lib/forms/form-failure.ts';
	import { variantFailedMessage } from '#lib/forms/variant-failure.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { ComicStyleEnum, type ComicStyle } from '#lib/types/index.ts';
	import { STYLES } from '#lib/utils/comicStyles.ts';

	/** Card copy by style id: a new style fails to compile until it has copy. */
	const STYLE_COPY: Record<ComicStyle, { name: () => string; description: () => string }> = {
		[ComicStyleEnum.enum.anime]: {
			name: () => m.styleAnime(),
			description: () => m.styleAnimeDescription(),
		},
		[ComicStyleEnum.enum['classic-marvel']]: {
			name: () => m.styleClassicMarvel(),
			description: () => m.styleClassicMarvelDescription(),
		},
		[ComicStyleEnum.enum['franco-belgian']]: {
			name: () => m.styleFrancoBelgian(),
			description: () => m.styleFrancoBelgianDescription(),
		},
		[ComicStyleEnum.enum.manga]: {
			name: () => m.styleManga(),
			description: () => m.styleMangaDescription(),
		},
		[ComicStyleEnum.enum.noir]: {
			name: () => m.styleNoir(),
			description: () => m.styleNoirDescription(),
		},
		[ComicStyleEnum.enum['newspaper-strip']]: {
			name: () => m.styleNewspaperStrip(),
			description: () => m.styleNewspaperStripDescription(),
		},
		[ComicStyleEnum.enum.watercolour]: {
			name: () => m.styleWatercolour(),
			description: () => m.styleWatercolourDescription(),
		},
		[ComicStyleEnum.enum.webtoon]: {
			name: () => m.styleWebtoon(),
			description: () => m.styleWebtoonDescription(),
		},
		[ComicStyleEnum.enum['pop-art']]: {
			name: () => m.stylePopArt(),
			description: () => m.stylePopArtDescription(),
		},
		[ComicStyleEnum.enum['ukiyo-e']]: {
			name: () => m.styleUkiyoE(),
			description: () => m.styleUkiyoEDescription(),
		},
	};

	// Counts UTF-16 code units, as the contract's `max` does, so the counter and the
	// rejection agree. Grouped by locale ("10 000" in sv-se, "10,000" in en).
	let story = $state('');
	const numbers = new Intl.NumberFormat(getLocale());
	const storyOver = $derived(story.length > STORY_MAX_LENGTH);

	// The messages of the fields the server rejected; each one is shown next to its field.
	let fieldErrors = $state<FieldMessages>({});

	const handleSubmit = withGlobalInstructions(
		enhanceAction<CreateComicResult>(
			m.loadingCreateComic(),
			async ({ data, showError }) => {
				expectWorkflow(await commitGeneratedComic(workflowDeps, data.comic));
				// The comic is saved with the cover variant that was made (REQ-011).
				if (data.failedVariant) {
					showError(variantFailedMessage(data.failedVariant));
				}
				await goto(resolve(`comic/${data.comic.id}`));
			},
			{
				onFieldErrors: (messages) => {
					fieldErrors = messages;
				},
			},
		),
	);

	/** The hint ids, plus the field's error id while the server rejects the field. */
	function describedBy(hintIds: string[], errorId: string, message: string | undefined) {
		return (message ? [...hintIds, errorId] : hintIds).join(' ');
	}
</script>

<Section data-testId={createComicFormTestId}>
	<p class="intro">
		{m.createComicIntro()}
		<span class="intro-more">{m.createComicIntroMore()}</span>
	</p>
	<form class="card" method="post" action={`?/${CREATE_COMIC_ACTION}`} use:enhance={handleSubmit}>
		<label>
			{m.urlToSource()}
			<span class="optional">{m.optional()}</span>
			<input
				type="text"
				name="url"
				aria-invalid={fieldErrors.url ? 'true' : undefined}
				aria-describedby={describedBy(
					['create-comic-url-hint'],
					'create-comic-url-error',
					fieldErrors.url,
				)}
				placeholder="https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna"
			/>
		</label>
		<p class="hint" id="create-comic-url-hint">{m.createComicUrlHint()}</p>
		<FieldError id="create-comic-url-error" message={fieldErrors.url} />
		<p class="or">{m.createComicOr()}</p>
		<div class="story-label">
			<label for="create-comic-story">
				{m.yourStory()}
				<span class="optional">{m.optional()}</span>
			</label>
			<!-- Not a live region: it follows typing, and the field's label is what gets announced. -->
			<p id="create-comic-story-count" class="count" class:over={storyOver}>
				{m.createComicStoryCount({
					count: numbers.format(story.length),
					max: numbers.format(STORY_MAX_LENGTH),
				})}
			</p>
		</div>
		<textarea
			id="create-comic-story"
			name="story"
			rows="6"
			bind:value={story}
			aria-invalid={fieldErrors.story ? 'true' : undefined}
			aria-describedby={describedBy(
				['create-comic-story-hint', 'create-comic-story-count'],
				'create-comic-story-error',
				fieldErrors.story,
			)}></textarea>
		<p class="hint" id="create-comic-story-hint">{m.createComicStoryHint()}</p>
		<FieldError id="create-comic-story-error" message={fieldErrors.story} />
		<label>
			{m.createComicPanelCount()}
			<input
				type="number"
				name="panelCount"
				min={PANEL_COUNT_MIN}
				max={PANEL_COUNT_MAX}
				step="1"
				required
				value={PANEL_COUNT_DEFAULT}
				aria-invalid={fieldErrors.panelCount ? 'true' : undefined}
				aria-describedby={describedBy(
					['create-comic-panel-count-hint'],
					'create-comic-panel-count-error',
					fieldErrors.panelCount,
				)}
			/>
		</label>
		<p class="hint" id="create-comic-panel-count-hint">{m.createComicPanelCountHint()}</p>
		<FieldError id="create-comic-panel-count-error" message={fieldErrors.panelCount} />
		<fieldset class="style-choice">
			<legend>{m.comicStyles()}</legend>
			<div class="style-cards">
				{#each Object.values(STYLES) as style (style.id)}
					<label class="style-card">
						<input
							type="radio"
							name="style"
							value={style.id}
							required
							checked={style.id === ComicStyleEnum.enum.anime}
							aria-labelledby={`style-name-${style.id}`}
							aria-describedby={`style-description-${style.id}`}
						/>
						<span class="style-text">
							<span class="style-name" id={`style-name-${style.id}`}>
								{STYLE_COPY[style.id].name()}
							</span>
							<span class="style-description" id={`style-description-${style.id}`}>
								{STYLE_COPY[style.id].description()}
							</span>
						</span>
					</label>
				{/each}
			</div>
		</fieldset>
		<p class="needs-key">
			<span>{m.createComicNeedsKey()}</span> ·
			<a href={resolve(localizedHref('/settings'))}>{m.settings()}</a>
		</p>
		<div class="actions">
			<a href={resolve(localizedHref('/'))}>{m.cancel()}</a>
			<button type="submit">{m.createComicSubmit()}</button>
		</div>
	</form>
</Section>

<style>
	.intro {
		color: var(--color-muted);
	}

	/* The longer intro line only fits beside the wide layout's heading width (48em and up). */
	.intro-more {
		display: none;
	}

	.card {
		padding: var(--space-3);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--card-radius);
		background: var(--color-surface);
	}

	.optional {
		font-weight: normal;
		color: var(--color-muted);
	}

	/* The counter sits on the label's row, at the right edge of the field. */
	.story-label {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.hint {
		margin-block: 0;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}

	.count {
		margin-block: 0;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}

	.count.over {
		color: var(--color-danger);
	}

	.or {
		margin-block: var(--space-2);
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}

	.needs-key {
		margin-block: var(--space-4) 0;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}

	/* The footer row stays in reach on a phone: it sticks to the bottom of the viewport. */
	.actions {
		position: sticky;
		inset-block-end: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-block-start: var(--space-4);
		padding-block: var(--space-3);
		border-block-start: var(--border-width) solid var(--color-border);
		background: var(--color-surface);
	}

	.actions button {
		margin-block-start: 0;
	}

	.actions a {
		color: var(--color-link);
	}

	/* The fieldset's border and legend come from app.css; the cards are the only choice inside it. */
	.style-choice {
		margin-block: var(--space-3) 0;
	}

	/* Three per row at every width; further styles wrap onto new rows of the same grid. */
	.style-cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-2);
	}

	/* A card is a label, so the whole card selects the style; the radio keeps native keys and semantics. */
	/* Three cards share a narrow row, so the radio sits above the text to give the names room. */
	.style-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-1);
		margin-block: 0;
		padding: var(--space-2);
		overflow-wrap: anywhere;
		border: var(--border-width) solid var(--color-control-border);
		border-radius: var(--card-radius);
		background: var(--color-background);
		cursor: pointer;
	}

	/* The checked card gets a thicker dark border, so the choice reads without colour. */
	.style-card:has(:checked) {
		border: var(--border-width-thick) solid var(--color-text);
	}

	.style-card:has(:focus-visible) {
		outline: var(--focus-width) solid var(--color-focus);
		outline-offset: var(--focus-offset);
	}

	.style-card input {
		flex-shrink: 0;
		margin-block: 0;
	}

	.style-text {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.style-name {
		font-weight: bold;
	}

	.style-description {
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}

	form :is(input, textarea) {
		scroll-margin-block-end: var(--form-actions-clearance);
	}

	@media (min-width: 48em) {
		.intro-more {
			display: inline;
		}

		.actions {
			position: static;
		}

		.card {
			padding: var(--space-4);
		}

		/* Wide cards have room for the radio beside its text, as in the single-row design. */
		.style-card {
			flex-direction: row;
			padding: var(--space-2) var(--space-3);
		}

		.style-card input {
			margin-block: var(--space-1) 0;
		}
	}
</style>
