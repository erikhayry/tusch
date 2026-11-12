<script lang="ts">
	import { enhance } from '$app/forms';
	import { comicCommands, expectCommitted } from '$lib/features/comics/client/comic-commands';
	import { getCharacter, getPanel } from '$lib/features/comics/client/comic-selectors';
	import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
	import {
		CREATE_PANEL_IMAGE_ACTION,
		type CreatePanelImageResult,
	} from '$lib/features/panels/contracts/createPanelImage';
	import { enhanceAction } from '$lib/forms/enhance-action';
	import { encodeFormValue } from '$lib/forms/form-data';
	import { m } from '$lib/paraglide/messages';
	import { cropImage } from '$lib/utils/crop/crop';
	import {
		IMAGE_VALUE_KEY,
		INCLUDE_IMAGE_VALUE_KEY,
		INSTRUCTIONS_VALUE_KEY,
	} from '$lib/utils/db/dbTypes';
	import { generateId } from '$lib/utils/id';
	import {
		getImage,
		getImageUrl,
		saveBase64Image,
		saveBlobImage,
	} from '$lib/utils/storage/storage';
	import type { CreatePanelImageFormProps } from './createPanelImageFormTypes';

	const handleSubmit = enhanceAction<CreatePanelImageResult>(async ({ data, update }) => {
		if (data.image) {
			const { comicId, panelId, image } = data;
			const panelImageFileName = await saveBase64Image(image.landscape.src);
			expectCommitted(
				comicCommands.replacePanelImage(comicId, panelId, {
					landscape: {
						src: panelImageFileName,
						width: image.landscape.width,
						height: image.landscape.height,
						characters: image.landscape.characters,
					},
					portrait: {
						src: panelImageFileName,
						width: image.landscape.width,
						height: image.landscape.height,
						characters: image.landscape.characters,
					},
					alt: image.alt,
				}),
			);

			const panelImage = getPanel(comicStore.comics, comicId, panelId)?.image;
			if (panelImage) {
				const characters = image.landscape.characters || [];
				for (const character of characters) {
					// The model can reference characters that are not in this comic; skip those crops.
					if (!getCharacter(comicStore.comics, comicId, character.id)) continue;

					const url = await getImageUrl(panelImage.landscape.src);

					const head = await cropImage(url, character.head);
					const charachterHeadImageFileName = await saveBlobImage(`${generateId()}.png`, head);

					const full = await cropImage(url, character.full);
					const charachterFullImageFileName = await saveBlobImage(`${generateId()}.png`, full);

					expectCommitted(
						comicCommands.addCharacterImage(comicId, character.id, {
							id: generateId(),
							panelId,
							head: {
								src: charachterHeadImageFileName,
								width: character.head.width,
								height: character.head.height,
							},
							full: {
								src: charachterFullImageFileName,
								width: character.head.width,
								height: character.head.height,
							},
						}),
					);
				}
			}
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

<form method="POST" action={`?/${CREATE_PANEL_IMAGE_ACTION}`} use:enhance={handleSubmit}>
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
