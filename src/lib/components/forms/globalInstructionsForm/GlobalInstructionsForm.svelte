<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import Heading from '$lib/components/relativeHeading/Heading.svelte';
	import Section from '$lib/components/relativeHeading/Section.svelte';
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

	let saved = $state(false);

	// Clear first and set the text after a tick, so a second save in a row changes the DOM
	// and is announced again.
	async function confirmSaved() {
		saved = false;
		await tick();
		saved = true;
	}

	// Nothing here needs the server (REQ-022, REQ-033).
	const handleSubmit = enhanceLocalCommand(
		getSaveGlobalInstructionsValues,
		saveGlobalInstructions,
		{
			onStart: () => (saved = false),
			onSuccess: confirmSaved,
		},
	);
</script>

<Section>
	<Heading>{m.globalInstructions()}</Heading>
	<form method="POST" use:enhance={handleSubmit}>
		<label for="global-instructions">{m.globalInstructions()}</label>
		<p id="global-instructions-hint">{m.globalInstructionsHint()}</p>
		<textarea
			id="global-instructions"
			name={GLOBAL_INSTRUCTIONS_VALUE_KEY}
			rows={5}
			aria-describedby="global-instructions-hint"
			bind:value={text}></textarea>
		<button type="submit">{m.saveGlobalInstructions()}</button>
		<!-- Always rendered so screen readers announce the text when it appears. -->
		<p role="status">{saved ? m.globalInstructionsSaved() : ''}</p>
	</form>
</Section>
