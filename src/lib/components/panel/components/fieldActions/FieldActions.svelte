<script lang="ts">
	import DeleteItemForm from '$lib/components/forms/deleteItemForm/DeleteItemForm.svelte';
	import EditTextFieldForm from '$lib/components/forms/editTextFieldForm/EditTextFieldForm.svelte';
	import { type FieldActionsProps } from './fieldActionsTypes';

	let {
		values,
		editActionLabel,
		saveActionLabel,
		removeActionLabel,
		visibleText,
	}: FieldActionsProps = $props();
	let number = $derived(values.index + 1);
</script>

<EditTextFieldForm
	{visibleText}
	label={editActionLabel({ number })}
	{values}
	saveActionLabel={saveActionLabel({ number })}
	editActionLabel={editActionLabel({ number })}
/>

<DeleteItemForm
	label={removeActionLabel({ number })}
	values={{
		comicId: values.comicId,
		panelId: values.panelId,
		index: values.index,
		type: values.type,
	}}
/>
