<script lang="ts">
	import { enhance } from '$app/forms';
	import { ACTION } from '$lib/utils/actions';
	import { addImage } from '$lib/utils/db/db';
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
					console.log(result.data);
					const fileUrl = await saveImage(
						`${generateId()}.png`,
						`data:image/png;base64,${image.src}`,
					);
					console.log('fileUrl', fileUrl);

					addImage(comicId, panelId, {
						wide: { src: fileUrl, width: image.width, height: image.height },
						narrow: { src: fileUrl, width: image.width, height: image.height },
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

	<button type="submit">{label}</button>
</form>
