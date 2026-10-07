<script lang="ts">
	import { enhance } from '$app/forms';
	import { ACTION } from '$lib/utils/actions';
	import { deleteType } from '$lib/utils/db/db';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { getDeleteValues } from '../utils/values';
	import type { DeleteItemFormProps } from './deleteItemFormTypes';

	//TODO a11y
	let isLoading = $state(false);

	const handleSubmit: SubmitFunction = async ({ formData }) => {
		deleteType(await getDeleteValues(formData));

		return async ({ update }) => {
			await update();
		};
	};

	let { label, values }: DeleteItemFormProps = $props();
</script>

<form method="POST" action={`?/${ACTION.CLIENT}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	{#if isLoading}
		<p>is loading...</p>
	{/if}

	<button type="submit">{label}</button>
</form>
