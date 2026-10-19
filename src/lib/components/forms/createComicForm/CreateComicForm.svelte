<script lang="ts" module>
	export const createComicFormTestId = 'createcomicform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Section from '$lib/components/relativeHeading/Section.svelte';
	import { m } from '$lib/paraglide/messages';
	import { ACTION } from '$lib/utils/actions/actions';
	import type { CreateComicResult } from '$lib/utils/actions/createComic';
	import { onSubmit } from '$lib/utils/actions/onSubmit';
	import { STYLES } from '$lib/utils/comicStyles';
	import { addComic } from '$lib/utils/db/db.svelte';
	import { generateId } from '$lib/utils/id';
	import { saveImage } from '$lib/utils/storage/storage';

	const handleSubmit = onSubmit<CreateComicResult>(async ({ result }) => {
		if (result.data?.comic) {
			const comic = result.data.comic;

			if (comic.cover) {
				const fileName = await saveImage(
					`${generateId()}.png`,
					`data:image/png;base64,${comic.cover.landscape.src}`,
				);
				comic.cover.landscape.src = fileName;
				comic.cover.portrait.src = fileName;
			}

			addComic(result.data.comic);
			await goto(resolve(`/comic/${result.data.comic.id}`));
		}
	});
</script>

<Section data-testId={createComicFormTestId}>
	<form method="post" action={`?/${ACTION.CREATE_COMIC}`} use:enhance={handleSubmit}>
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
