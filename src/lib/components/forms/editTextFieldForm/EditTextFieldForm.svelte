<script lang="ts">
	import { enhance } from '$app/forms';
	import { applyItemEdit } from '$lib/features/comics/client/item-commands';
	import { EDIT_TEXT_ACTION, getEditValues } from '$lib/features/panels/contracts/editText';
	import { enhanceClientCommand } from '$lib/forms/enhance-client-command';
	import { m } from '$lib/paraglide/messages';
	import { type EditTextFieldFormProps } from './editTextFieldFormTypes';

	//TODO a11y
	let editable = $state(false);

	const handleSubmit = enhanceClientCommand(
		m.loadingEdit(),
		getEditValues,
		applyItemEdit,
		async ({ update }) => {
			editable = false;
			await update();
		},
	);

	const toggleEditing = () => {
		editable = !editable;
	};

	let { values, label, saveActionLabel, editActionLabel, visibleText }: EditTextFieldFormProps =
		$props();
</script>

{#if editable}
	<form method="POST" action={`?/${EDIT_TEXT_ACTION}`} use:enhance={handleSubmit}>
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
