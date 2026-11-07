<script lang="ts" module>
	export const createCharacterImageFormTestId = 'createcharacterimageform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		CREATE_CHARACTER_IMAGE_ACTION,
		getCreateCharacterImageValues,
	} from '$lib/features/panels/contracts/createCharacterImage';
	import { cropImage } from '$lib/utils/crop/crop';
	import { globalLoading } from '$lib/utils/states/loading.svelte';
	import { getImageUrl } from '$lib/utils/storage/storage';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { type CreateCharacterImageFormProps } from './createCharacterImageFormTypes';

	let imageSrc = $state<string | null>(null);

	const handleSubmit: SubmitFunction = async ({ formData }) => {
		globalLoading.start();
		const characterImageResult = await getCreateCharacterImageValues(formData);
		if (characterImageResult.success) {
			const { crop, image } = characterImageResult.data;
			const url = await getImageUrl(image);
			const newImage = await cropImage(url, crop);
			imageSrc = URL.createObjectURL(newImage);
		}

		return () => {
			globalLoading.stop();
		};
	};

	let { label, values }: CreateCharacterImageFormProps = $props();
</script>

<form method="POST" action={`?/${CREATE_CHARACTER_IMAGE_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input
			type="hidden"
			name={entry[0]}
			value={typeof entry[1] === 'object' ? JSON.stringify(entry[1]) : entry[1]}
		/>
	{/each}
	<img src={imageSrc} alt="" />

	<button type="submit">{label}</button>
</form>
