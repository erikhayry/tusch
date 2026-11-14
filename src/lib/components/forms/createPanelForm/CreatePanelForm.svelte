<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { expectCommitted } from '$lib/features/comics/client/comic-commands';
	import { insertGeneratedPanel } from '$lib/features/panels/client/workflows/insert-generated-panel';
	import {
		CREATE_PANEL_ACTION,
		type CreatePanelResult,
	} from '$lib/features/panels/contracts/createPanel';
	import { withGlobalInstructions } from '$lib/features/settings/client/global-instructions';
	import { enhanceAction } from '$lib/forms/enhance-action';
	import { m } from '$lib/paraglide/messages';
	import { encodeFormValue } from '$lib/forms/form-data';
	import { type CreatePanelFormProps } from './createPanelFormTypes';

	const handleSubmit = withGlobalInstructions(
		enhanceAction<CreatePanelResult>(m.loadingCreatePanel(), async ({ data, update }) => {
			expectCommitted(insertGeneratedPanel(workflowDeps.commands, data));
			await update();
		}),
	);

	let { label, values }: CreatePanelFormProps = $props();
</script>

<form method="POST" action={`?/${CREATE_PANEL_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={encodeFormValue(entry[1])} />
	{/each}

	<button type="submit">{label}</button>
</form>
