<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { type TextFieldFormProps } from './textFieldFormTypes';

	let editable = $state(false);

	let { action, values, label, saveActionLabel, editActionLabel, visibleText }: TextFieldFormProps =
		$props();

	function toggleEditing() {
		editable = !editable;
	}
</script>

{#if editable}
	<form method="POST" action={`?/${action}`}>
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
