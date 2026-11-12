<script lang="ts">
	import { enhance } from '$app/forms';
	import { comicCommands, expectCommitted } from '$lib/features/comics/client/comic-commands';
	import {
		CREATE_COVER_IMAGE_ACTION,
		type CreateCoverImageResult,
	} from '$lib/features/comics/contracts/createCoverImage';
	import { enhanceAction } from '$lib/forms/enhance-action';
	import { encodeFormValue } from '$lib/forms/form-data';
	import { m } from '$lib/paraglide/messages';
	import {
		IMAGE_VALUE_KEY,
		INCLUDE_IMAGE_VALUE_KEY,
		INSTRUCTIONS_VALUE_KEY,
	} from '$lib/utils/db/dbTypes';
	import { getImage, saveBase64Image } from '$lib/utils/storage/storage';
	import type { CreateCoverImageFormProps } from './createCoverImageFormTypes';

	const handleSubmit = enhanceAction<CreateCoverImageResult>(async ({ data, update }) => {
		const { landscape, portrait, alt } = data.image;
		const fileName = await saveBase64Image(landscape.src);
		expectCommitted(
			comicCommands.replaceCover(data.comicId, {
				alt,
				landscape: { ...landscape, src: fileName },
				portrait: { ...portrait, src: fileName },
			}),
		);
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

<form method="POST" action={`?/${CREATE_COVER_IMAGE_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={encodeFormValue(entry[1])} />
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
