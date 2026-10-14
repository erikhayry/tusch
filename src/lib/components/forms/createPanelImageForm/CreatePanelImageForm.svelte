<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { ACTION, type CreatePanelImageResult } from '$lib/utils/actions/actions';
	import { onSubmit } from '$lib/utils/actions/onSubmit';
	import { addImage } from '$lib/utils/db/db';
	import {
		IMAGE_VALUE_KEY,
		INCLUDE_IMAGE_VALUE_KEY,
		INSTRUCTIONS_VALUE_KEY,
	} from '$lib/utils/db/dbTypes';
	import { generateId } from '$lib/utils/id';
	import { getImage, saveImage } from '$lib/utils/storage/storage';
	import type { CreatePanelImageFormProps } from './createPanelImageFormTypes';

	const handleSubmit = onSubmit<CreatePanelImageResult>(async ({ update, result }) => {
		if (result.data?.image) {
			const { comicId, panelId, image } = result.data;
			const fileName = await saveImage(
				`${generateId()}.png`,
				`data:image/png;base64,${image.landscape.src}`,
			);

			addImage(comicId, panelId, {
				landscape: {
					src: fileName,
					width: image.landscape.width,
					height: image.landscape.height,
					characters: image.landscape.characters,
				},
				portrait: {
					src: fileName,
					width: image.landscape.width,
					height: image.landscape.height,
					characters: image.landscape.characters,
				},
				alt: image.landscape.alt,
			});
		}
		await update();
	});

	let { label, values, imageName }: CreatePanelImageFormProps = $props();

	let imageUrl = $state<string | null>(null);

	$effect(() => {
		if (imageName) {
			getImage(imageName).then((url) => {
				imageUrl = url;
			});
		}
	});
</script>

<form method="POST" action={`?/${ACTION.CREATE_PANEL_IMAGE}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
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
