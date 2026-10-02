<script lang="ts">
	import DeleteItemForm from '$lib/components/deleteItemForm/DeleteItemForm.svelte';
	import TextFieldForm from '$lib/components/textFieldForm/TextFieldForm.svelte';
	import { ACTION } from '$lib/utils/actions';
	import { type FieldActionsProps } from './fieldActionsTypes';

	let { values, editActionLabel, saveActionLabel, removeActionLabel }: FieldActionsProps = $props();
	let number = $derived(values.index + 1);
</script>

<TextFieldForm
	action={ACTION.EDIT}
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
