<script lang="ts" module>
	export const createComicFormTestId = 'createcomicform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Section from '$lib/components/relativeHeading/Section.svelte';
	import {
		CREATE_COMIC_ACTION,
		type CreateComicResult,
	} from '$lib/features/comics/contracts/createComic';
	import { m } from '$lib/paraglide/messages';
	import { onSubmit } from '$lib/utils/actions/onSubmit';
	import { STYLES } from '$lib/utils/comicStyles';
	import { addComic } from '$lib/utils/db/db.svelte';
	import { saveBase64Image } from '$lib/utils/storage/storage';

	const handleSubmit = onSubmit<CreateComicResult>(async ({ result }) => {
		if (result.data?.comic) {
			const comic = result.data.comic;

			if (comic.cover) {
				const fileName = await saveBase64Image(comic.cover.landscape.src);
				comic.cover.landscape.src = fileName;
				comic.cover.portrait.src = fileName;
			}

			addComic(result.data.comic);
			await goto(resolve(`/comic/${result.data.comic.id}`));
		}
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
