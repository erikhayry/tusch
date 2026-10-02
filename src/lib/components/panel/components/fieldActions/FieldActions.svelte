<script lang="ts">
	import DeleteItemForm from '$lib/components/deleteItemForm/DeleteItemForm.svelte';
	import TextFieldForm from '$lib/components/textFieldForm/TextFieldForm.svelte';
	import { ACTION } from '$lib/utils/actions';
	import { type FieldActionsProps } from './fieldActionsTypes';

	let {
		field,
		comicId,
		panelId,
		index,
		value,
		editActionLabel,
		saveActionLabel,
		removeActionLabel,
	}: FieldActionsProps = $props();
	let number = $derived(index + 1);
</script>

<TextFieldForm
	action={ACTION.EDIT}
	field={{ value, name: 'value' }}
	label={editActionLabel({ number })}
	values={[
		{ name: 'comicId', value: comicId },
		{ name: 'panelId', value: panelId },
		{ name: 'index', value: index },
		{ name: 'field', value: field },
	]}
	saveActionLabel={saveActionLabel({ number })}
	editActionLabel={editActionLabel({ number })}
/>

<DeleteItemForm
	label={removeActionLabel({ number })}
	values={{
		comicId,
		panelId,
		index,
		type: field,
	}}
/>
