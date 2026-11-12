<script lang="ts">
	import { enhance } from '$app/forms';
	import { comicCommands, expectCommitted } from '$lib/features/comics/client/comic-commands';
	import {
		CREATE_PANEL_ACTION,
		type CreatePanelResult,
	} from '$lib/features/panels/contracts/createPanel';
	import { enhanceAction } from '$lib/forms/enhance-action';
	import { encodeFormValue } from '$lib/forms/form-data';
	import { type CreatePanelFormProps } from './createPanelFormTypes';

	const handleSubmit = enhanceAction<CreatePanelResult>(async ({ data, update }) => {
		expectCommitted(comicCommands.insertPanel(data.comicId, data.panel, data.index));
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
