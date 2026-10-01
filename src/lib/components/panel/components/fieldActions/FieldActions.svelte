<script lang="ts">
	import RemoveFieldItemForm from '$lib/components/removeFieldItemForm/RemoveFieldItemForm.svelte';
	import TextFieldForm from '$lib/components/textFieldForm/TextFieldForm.svelte';
	import { ACTION } from '../../utils/actions';
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
	action={ACTION.EDIT_FIELD_ITEM}
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

<RemoveFieldItemForm
	action={ACTION.DELETE_FIELD_ITEM}
	values={[
		{ name: 'comicId', value: comicId },
		{ name: 'panelId', value: panelId },
		{ name: 'index', value: index },
		{ name: 'field', value: field },
	]}
	label={removeActionLabel({ number })}
/>
