<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { ACTION } from '$lib/utils/actions/actions';
	import { onSubmit } from '$lib/utils/actions/onSubmit';
	import {
		IMAGE_VALUE_KEY,
		INCLUDE_IMAGE_VALUE_KEY,
		INSTRUCTIONS_VALUE_KEY,
	} from '$lib/utils/db/dbTypes';
	import { getImage } from '$lib/utils/storage/storage';
	import type { CreateCoverImageFormProps } from './createCoverImageFormTypes';

	const handleSubmit = onSubmit<unknown>(async ({ update, result }) => {
		if (result.data?.image) {
			//TODO
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
