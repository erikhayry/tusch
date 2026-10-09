<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { ACTION } from '$lib/utils/actions';
	import { addImage } from '$lib/utils/db/db';
	import { INSTRUCTIONS_VALUE_KEY } from '$lib/utils/db/dbTypes';
	import { generateId } from '$lib/utils/id';
	import { globalLoading } from '$lib/utils/states/loading.svelte';
	import { saveImage } from '$lib/utils/storage/storage';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { CreateImageFormProps } from './createImageFormTypes';

	const handleSubmit: SubmitFunction = async () => {
		globalLoading.start();

		return async ({ update, result }) => {
			try {
				if (result.type === 'success' && result.data?.image) {
					const { comicId, panelId, image } = result.data;
					const fileName = await saveImage(
						`${generateId()}.png`,
						`data:image/png;base64,${image.src}`,
					);

					addImage(comicId, panelId, {
						wide: { src: fileName, width: image.width, height: image.height },
						narrow: { src: fileName, width: image.width, height: image.height },
						alt: image.alt,
					});
				}
				await update();
			} finally {
				globalLoading.stop();
			}
		};
	};

	let { label, values }: CreateImageFormProps = $props();
</script>

<form method="POST" action={`?/${ACTION.CREATE_IMAGE}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	<label for={INSTRUCTIONS_VALUE_KEY}>
		{m.instructions()}
		<textarea id={INSTRUCTIONS_VALUE_KEY} name={INSTRUCTIONS_VALUE_KEY} rows={5}></textarea>
	</label>

	<button type="submit">{label}</button>
</form>
