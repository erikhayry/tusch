<script lang="ts" module>
	export const createCharacterImageFormTestId = 'createcharacterimageform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { createCharacterCrop } from '$lib/features/panels/client/workflows/create-character-crop';
	import {
		CREATE_CHARACTER_IMAGE_ACTION,
		getCreateCharacterImageValues,
		type CreateCharacterImageValue,
	} from '$lib/features/panels/contracts/createCharacterImage';
	import { enhanceClientCommand } from '$lib/forms/enhance-client-command';
	import { m } from '$lib/paraglide/messages';
	import { encodeFormValue } from '$lib/forms/form-data';

	import { type CreateCharacterImageFormProps } from './createCharacterImageFormTypes';

	let imageSrc = $state<string | null>(null);

	// Preview only: crop the stored panel image after the no-op action succeeds.
	async function showCrop(values: CreateCharacterImageValue) {
		const cropped = await createCharacterCrop(workflowDeps, values);
		if (imageSrc) URL.revokeObjectURL(imageSrc);
		imageSrc = URL.createObjectURL(cropped);
	}

	const handleSubmit = enhanceClientCommand(
		m.loadingCreateCharacterImage(),
		getCreateCharacterImageValues,
		showCrop,
	);

	let { label, values }: CreateCharacterImageFormProps = $props();
</script>

<form method="POST" action={`?/${CREATE_CHARACTER_IMAGE_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={encodeFormValue(entry[1])} />
	{/each}
	<img src={imageSrc} alt="" />

	<button type="submit">{label}</button>
</form>
