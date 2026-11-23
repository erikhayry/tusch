<script lang="ts" module>
	export const createComicFormTestId = 'createcomicform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { expectWorkflow } from '#lib/features/comics/client/workflows/asset-workflow.ts';
	import { commitGeneratedComic } from '#lib/features/comics/client/workflows/commit-generated-comic.ts';
	import {
		CREATE_COMIC_ACTION,
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
	<form method="post" action={`?/${CREATE_COMIC_ACTION}`} use:enhance={handleSubmit}>
		<p id="create-comic-hint">{m.createComicSourceHint()}</p>
		<label>
			{m.urlToSource()}
			<input
				type="text"
				name="url"
				aria-describedby="create-comic-hint"
				placeholder="https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna"
			/>
		</label>
		<label>
			{m.yourStory()}
			<textarea name="story" rows="6" aria-describedby="create-comic-hint"></textarea>
		</label>
		<label>
			{m.comicStyles()}
			<select name="style" required>
				{#each Object.values(STYLES) as style (style.id)}
					<option value={style.id}>{style.id}</option>
				{/each}
			</select>
		</label>
		<button type="submit">{m.submit()}</button>
	</form>
</Section>
