<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		CREATE_PANEL_ACTION,
		type CreatePanelResult,
	} from '$lib/features/panels/contracts/createPanel';
	import { encodeFormValue } from '$lib/forms/form-data';
	import { onSubmit } from '$lib/utils/actions/onSubmit';
	import { addPanel } from '$lib/utils/db/db.svelte';
	import { type CreatePanelFormProps } from './createPanelFormTypes';

	const handleSubmit = onSubmit<CreatePanelResult>(async ({ update, result }) => {
		if (result.data?.panel) {
			const { comicId, panel, index } = result.data;
			addPanel(comicId, panel, index);
		}
		await update();
	});

	let { label, values }: CreatePanelFormProps = $props();
</script>

<form method="POST" action={`?/${CREATE_PANEL_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={encodeFormValue(entry[1])} />
	{/each}

	<button type="submit">{label}</button>
</form>
