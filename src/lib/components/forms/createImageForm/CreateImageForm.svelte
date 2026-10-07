<script lang="ts">
	import { enhance } from '$app/forms';
	import { ACTION } from '$lib/utils/actions';
	import { addImage } from '$lib/utils/db/db';
	import { generateId } from '$lib/utils/id';
	import { saveImage } from '$lib/utils/storage/storage';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { CreateImageFormProps } from './createImageFormTypes';

	let isLoading = $state(false);

	const handleSubmit: SubmitFunction = async () => {
		isLoading = true;

		return async ({ update, result }) => {
			try {
				if (result.type === 'success' && result.data?.image) {
					const { comicId, panelId, image } = result.data;
					const fileUrl = await saveImage(
						`${generateId()}.png`,
						`data:image/png;base64,${image.src}`,
					);

					addImage(comicId, panelId, {
						wide: { src: fileUrl, width: image.width, height: image.height },
						narrow: { src: fileUrl, width: image.width, height: image.height },
						alt: image.alt,
					});
				}
				await update();
			} finally {
				isLoading = false;
			}
		};
	};

	let { label, values }: CreateImageFormProps = $props();
</script>

<form method="POST" action={`?/${ACTION.CREATE_IMAGE}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	{#if isLoading}
		<p>is loading...</p>
	{/if}

	<button type="submit" disabled={isLoading}>{label}</button>
</form>
