<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { type TextFieldFormProps } from './textFieldFormTypes';

	let editable = $state(false);

	let { action, values, field, label, saveActionLabel, editActionLabel }: TextFieldFormProps =
		$props();

	function toggleEditing() {
		editable = !editable;
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
		<button type="button" onclick={toggleEditing}>{m.cancel()}</button>
	</form>
{:else}
	<p>{field.value}</p>
	<button type="button" onclick={toggleEditing}>
		{editActionLabel}
	</button>
{/if}
