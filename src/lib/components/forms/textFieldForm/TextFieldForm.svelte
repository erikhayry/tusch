<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { ACTION } from '$lib/utils/actions';
	import { editType } from '$lib/utils/db/db';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { getEditValues } from '../utils/values';
	import { type TextFieldFormProps } from './textFieldFormTypes';

	//TODO a11y
	let editable = $state(false);
	let isLoading = $state(false);

	const handleSubmit: SubmitFunction = async ({ formData }) => {
		isLoading = true;

		editType(await getEditValues(formData));

		return async ({ update }) => {
			isLoading = false;
			editable = false;

			await update();
		};
	};

	function toggleEditing() {
		editable = !editable;
	}

	let { values, label, saveActionLabel, editActionLabel, visibleText }: TextFieldFormProps =
		$props();
</script>

{#if isLoading}
	<p>is loading...</p>
{/if}

{#if editable}
	<form method="POST" action={`?/${ACTION.CLIENT}`} use:enhance={handleSubmit}>
		{#each Object.entries(values) as entry (entry[0])}
			{#if entry[0] === 'value'}
				<label>
					<span>{label}</span>
					<input type="text" name={entry[0]} value={entry[1]} />
				</label>
			{:else}
				<input type="hidden" name={entry[0]} value={entry[1]} />
			{/if}
		{/each}

		<button type="submit">{saveActionLabel}</button>
		<button type="button" onclick={toggleEditing}>{m.cancel()}</button>
	</form>
{:else}
	<p>{visibleText}</p>
	<button type="button" onclick={toggleEditing}>
		{editActionLabel}
	</button>
{/if}
