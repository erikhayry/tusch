<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import { ACTION } from '$lib/utils/actions/actions';
	import { onEdit, type SubmitCallback } from '$lib/utils/actions/onEdit';
	import { editType } from '$lib/utils/db/db';
	import { getEditValues } from '../utils/values';
	import { type EditTextFieldFormProps } from './editTextFieldFormTypes';

	//TODO a11y
	let editable = $state(false);

	const onSuccess: SubmitCallback = async ({ update }) => {
		editable = false;
		await update();
	};

	const handleSubmit = onEdit(getEditValues, editType, onSuccess);

	const toggleEditing = () => {
		editable = !editable;
	};

	let { values, label, saveActionLabel, editActionLabel, visibleText }: EditTextFieldFormProps =
		$props();
</script>

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
