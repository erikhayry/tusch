<script lang="ts" module>
	export const createComicFormTestId = 'createcomicform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { localizedHref } from '#lib/components/header/header-navigation.ts';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { expectWorkflow } from '#lib/features/comics/client/workflows/asset-workflow.ts';
	import { commitGeneratedComic } from '#lib/features/comics/client/workflows/commit-generated-comic.ts';
	import {
		CREATE_COMIC_ACTION,
		PANEL_COUNT_DEFAULT,
		PANEL_COUNT_MAX,
		PANEL_COUNT_MIN,
		type CreateComicResult,
	} from '#lib/features/comics/contracts/createComic.ts';
	import { withGlobalInstructions } from '#lib/features/settings/client/global-instructions.ts';
	import { enhanceAction } from '#lib/forms/enhance-action.ts';
	import { variantFailedMessage } from '#lib/forms/variant-failure.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { STYLES } from '#lib/utils/comicStyles.ts';

	const handleSubmit = withGlobalInstructions(
		enhanceAction<CreateComicResult>(m.loadingCreateComic(), async ({ data, showError }) => {
			expectWorkflow(await commitGeneratedComic(workflowDeps, data.comic));
			// The comic is saved with the cover variant that was made (REQ-011).
			if (data.failedVariant) {
				showError(variantFailedMessage(data.failedVariant));
			}
			await goto(resolve(`comic/${data.comic.id}`));
		}),
	);
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
				aria-describedby="create-comic-url-hint"
				placeholder="https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna"
			/>
		</label>
		<p class="hint" id="create-comic-url-hint">{m.createComicUrlHint()}</p>
		<p class="or">{m.createComicOr()}</p>
		<label>
			{m.yourStory()}
			<span class="optional">{m.optional()}</span>
			<textarea name="story" rows="6" aria-describedby="create-comic-story-hint"></textarea>
		</label>
		<p class="hint" id="create-comic-story-hint">{m.createComicStoryHint()}</p>
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
				aria-describedby="create-comic-panel-count-hint"
			/>
		</label>
		<p class="hint" id="create-comic-panel-count-hint">{m.createComicPanelCountHint()}</p>
		<label>
			{m.comicStyles()}
			<select name="style" required>
				{#each Object.values(STYLES) as style (style.id)}
					<option value={style.id}>{style.id}</option>
				{/each}
			</select>
		</label>
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

	.hint {
		margin-block: 0;
		font-size: var(--font-size-small);
		color: var(--color-muted);
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

	form :is(input, select, textarea) {
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
	}
</style>
