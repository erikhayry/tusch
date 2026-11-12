<script lang="ts" module>
	export const createComicFormTestId = 'createcomicform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Section from '$lib/components/relativeHeading/Section.svelte';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { expectWorkflow } from '$lib/features/comics/client/workflows/asset-workflow';
	import { commitGeneratedComic } from '$lib/features/comics/client/workflows/commit-generated-comic';
	import {
		CREATE_COMIC_ACTION,
		type CreateComicResult,
	} from '$lib/features/comics/contracts/createComic';
	import { enhanceAction } from '$lib/forms/enhance-action';
	import { m } from '$lib/paraglide/messages';
	import { STYLES } from '$lib/utils/comicStyles';

	const handleSubmit = enhanceAction<CreateComicResult>(async ({ data }) => {
		expectWorkflow(await commitGeneratedComic(workflowDeps, data.comic));
		await goto(resolve(`/comic/${data.comic.id}`));
	});
</script>

<Section data-testId={createComicFormTestId}>
	<form method="post" action={`?/${CREATE_COMIC_ACTION}`} use:enhance={handleSubmit}>
		<label>
			Url to source
			<input
				type="text"
				name="url"
				placeholder="https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna"
			/>
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
