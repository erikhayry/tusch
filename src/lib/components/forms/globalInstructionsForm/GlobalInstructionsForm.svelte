<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		readGlobalInstructions,
		saveGlobalInstructions,
	} from '$lib/features/settings/client/global-instructions';
	import {
		GLOBAL_INSTRUCTIONS_VALUE_KEY,
		getSaveGlobalInstructionsValues,
	} from '$lib/features/settings/contracts/globalInstructions';
	import { enhanceLocalCommand } from '$lib/forms/enhance-local-command';
	import { m } from '$lib/paraglide/messages';

	// The page is server-rendered, so the stored text is only known after hydration.
	// No `maxlength`: an over-long value must reach the contract and show its error.
	// A `$derived` would read localStorage during hydration and disagree with the server HTML.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let text = $state('');
	$effect(() => {
		text = readGlobalInstructions();
	});

	// Nothing here needs the server (REQ-022, REQ-033).
	const handleSubmit = enhanceLocalCommand(getSaveGlobalInstructionsValues, saveGlobalInstructions);
</script>

<form method="POST" use:enhance={handleSubmit}>
	<label>
		<span>{m.globalInstructions()}</span>
		<textarea name={GLOBAL_INSTRUCTIONS_VALUE_KEY} rows={5} bind:value={text}></textarea>
	</label>
	<button type="submit">{m.saveGlobalInstructions()}</button>
</form>
