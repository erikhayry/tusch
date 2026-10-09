<script lang="ts" module>
	export const createComicFormTestId = 'createcomicform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Section from '$lib/components/relativeHeading/Section.svelte';
	import { m } from '$lib/paraglide/messages';
	import { ACTION } from '$lib/utils/actions';
	import { STYLES } from '$lib/utils/comicStyles';
	import { addComic } from '$lib/utils/db/db';
	import { globalLoading } from '$lib/utils/states/loading.svelte';
	import { type SubmitFunction } from '@sveltejs/kit';

	const handleSubmit: SubmitFunction = async () => {
		globalLoading.start();

		return async ({ result }) => {
			try {
				if (result.type === 'success' && result.data) {
					const { comic } = result.data;
					addComic(comic);

					await goto(resolve(`/comic/${comic.id}`));
				}
			} finally {
				globalLoading.stop();
			}
		};
	};
</script>

<Section data-testId={createComicFormTestId}>
	<form method="post" action={`?/${ACTION.CREATE_COMIC}`} use:enhance={handleSubmit}>
		<label>
			Url to source
			<input
				type="text"
				required
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
