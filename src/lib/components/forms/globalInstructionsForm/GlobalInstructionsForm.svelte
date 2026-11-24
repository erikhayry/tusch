<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import Heading from '#lib/components/relativeHeading/Heading.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import {
		readGlobalInstructions,
		saveGlobalInstructions,
	} from '#lib/features/settings/client/global-instructions.ts';
	import {
		GLOBAL_INSTRUCTIONS_MAX_LENGTH,
		GLOBAL_INSTRUCTIONS_VALUE_KEY,
		getSaveGlobalInstructionsValues,
	} from '#lib/features/settings/contracts/globalInstructions.ts';
	import { enhanceLocalCommand } from '#lib/forms/enhance-local-command.ts';
	import { m } from '#lib/paraglide/messages.js';

	// The page is server-rendered, so the stored text is only known after hydration.
	// No `maxlength`: an over-long value must reach the contract and show its error.
	// A `$derived` would read localStorage during hydration and disagree with the server HTML.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let text = $state('');
	$effect(() => {
		text = readGlobalInstructions();
	});

	// Counts UTF-16 code units, as the contract's `max` does, so the counter and the
	// rejection agree.
	const over = $derived(text.length > GLOBAL_INSTRUCTIONS_MAX_LENGTH);

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
		<label for="global-instructions">{m.globalInstructionsLabel()}</label>
		<p id="global-instructions-hint">{m.globalInstructionsHint()}</p>
		<textarea
			id="global-instructions"
			name={GLOBAL_INSTRUCTIONS_VALUE_KEY}
			rows={5}
			placeholder={m.globalInstructionsPlaceholder()}
			aria-describedby="global-instructions-hint global-instructions-count"
			bind:value={text}></textarea>
		<!-- Not a live region: it follows typing, and the saved status below is what gets announced. -->
		<p id="global-instructions-count" class="count" class:over>
			{m.globalInstructionsCount({ count: text.length, max: GLOBAL_INSTRUCTIONS_MAX_LENGTH })}
		</p>
		<button type="submit">{m.saveGlobalInstructions()}</button>
		<!-- Always rendered so screen readers announce the text when it appears. -->
		<p role="status">{saved ? m.globalInstructionsSaved() : ''}</p>
	</form>
</Section>

<style>
	.count {
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}

	.count.over {
		color: var(--color-danger);
	}
</style>
