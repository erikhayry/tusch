<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { expectCommitted } from '#lib/features/comics/client/comic-commands.ts';
	import { insertGeneratedPanel } from '#lib/features/panels/client/workflows/insert-generated-panel.ts';
	import {
		CREATE_PANEL_ACTION,
		type CreatePanelResult,
	} from '#lib/features/panels/contracts/createPanel.ts';
	import { withGlobalInstructions } from '#lib/features/settings/client/global-instructions.ts';
	import { enhanceAction } from '#lib/forms/enhance-action.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { encodeFormValue } from '#lib/forms/form-data.ts';
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

	<!-- The sign is decoration: the name (and the tooltip) says which insertion point this is. -->
	<button type="submit" aria-label={label} title={label}><span aria-hidden="true">+</span></button>
</form>

<style>
	form {
		display: flex;
	}

	button {
		margin: 0;
		inline-size: var(--control-min-size);
		padding: 0;
		font-size: var(--font-size-h2);
		line-height: 1;
	}
</style>
