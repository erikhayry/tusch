<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { ACTION } from '$lib/utils/actions/actions';
	import type { CreateCoverImageResult } from '$lib/utils/actions/createCoverImage';
	import { onSubmit } from '$lib/utils/actions/onSubmit';
	import { addCoverImage } from '$lib/utils/db/db.svelte';
	import {
		IMAGE_VALUE_KEY,
		INCLUDE_IMAGE_VALUE_KEY,
		INSTRUCTIONS_VALUE_KEY,
	} from '$lib/utils/db/dbTypes';
	import { generateId } from '$lib/utils/id';
	import { getImage, saveImage } from '$lib/utils/storage/storage';
	import type { CreateCoverImageFormProps } from './createCoverImageFormTypes';

	const handleSubmit = onSubmit<CreateCoverImageResult>(async ({ update, result }) => {
		if (result.data) {
			const { landscape, portrait, alt } = result.data.image;
			const fileName = await saveImage(
				`${generateId()}.png`,
				`data:image/png;base64,${landscape.src}`,
			);
			addCoverImage(result.data.comicId, {
				alt,
				landscape: { ...landscape, src: fileName },
				portrait: { ...portrait, src: fileName },
			});
		}
		await update();
	});

	let { label, values, imageName }: CreateCoverImageFormProps = $props();

	let imageUrl = $state<string | null>(null);

	$effect(() => {
		if (imageName) {
			getImage(imageName).then((url) => {
				imageUrl = url;
			});
		}
	});
</script>

<form method="POST" action={`?/${ACTION.CREATE_COVER_IMAGE}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={JSON.stringify(entry[1])} />
	{/each}

	{#if imageName}
		<img width="50px" height="auto" src={imageUrl} alt="" />
		<label for={INCLUDE_IMAGE_VALUE_KEY}>
			<input type="hidden" name={IMAGE_VALUE_KEY} value={imageUrl} />
			<input type="checkbox" id={INCLUDE_IMAGE_VALUE_KEY} name={INCLUDE_IMAGE_VALUE_KEY} />
			<span>{m.includeImage()}</span>
		</label>
	{/if}

	<label for={INSTRUCTIONS_VALUE_KEY}>
		{m.instructions()}
		<textarea id={INSTRUCTIONS_VALUE_KEY} name={INSTRUCTIONS_VALUE_KEY} rows={5}></textarea>
	</label>

	<button type="submit">{label}</button>
</form>
