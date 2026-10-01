<script lang="ts">
	import { type TextFieldFormProps } from './textFieldFormTypes';

	let editable = $state(false);

	let { action, values, field, label, saveActionLabel, editActionLabel }: TextFieldFormProps =
		$props();

	function startEditing() {
		editable = true;
	}
</script>

{#if editable}
	<form method="POST" action={`?/${action}`}>
		{#each values as value (value.name)}
			<input type="hidden" name={value.name} value={value.value} />
		{/each}

		<label>
			<span>{label}</span>
			<input type="text" name={field.name} value={field.value} />
		</label>
		<button type="submit">{saveActionLabel}</button>
	</form>
{:else}
	<p>{field.value}</p>
	<button type="button" onclick={startEditing}>
		{editActionLabel}
	</button>
{/if}
