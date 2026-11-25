<script lang="ts" module>
	export const loginFormTestId = 'loginform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	import { m } from '#lib/paraglide/messages.js';

	import {
		BYOK_ACTION,
		type ValidateApiKeyResult,
	} from '#lib/features/settings/contracts/validateApiKey.ts';
	import { enhanceAction } from '#lib/forms/enhance-action.ts';
	import type { FieldMessages } from '#lib/forms/form-failure.ts';
	import FieldError from '#lib/components/fieldError/FieldError.svelte';
	import { describedBy } from '#lib/components/fieldError/describedBy.ts';
	import { tick } from 'svelte';

	import { type LoginFormProps } from './loginFormTypes';

	let { hasKey, onSaved }: LoginFormProps = $props();

	let success = $state<boolean | null>(null);
	let statusElement = $state<HTMLElement>();
	let fieldErrors = $state<FieldMessages>({});

	// Failures (invalid input, rate limits, provider errors) surface in the global
	// error region via the shared enhancer.
	const handleSubmit = enhanceAction<ValidateApiKeyResult>(
		m.loadingValidateKey(),
		async ({ data }) => {
			success = data.success;
			if (!data.success) {
				return;
			}

			await onSaved?.();
			// The submit button is removed on success, so focus would fall back to the
			// body. Move it to the status line, which the screen reader announces too.
			await tick();
			statusElement?.focus();
		},
		{
			onFieldErrors: (messages) => {
				fieldErrors = messages;
			},
		},
	);

	// One status element, always rendered: a live region only announces text that
	// changes while it is in the DOM.
	const statusMessage = $derived(
		success === true ? m.keyAdded() : success === false ? m.invalidKey() : '',
	);
</script>

<!-- Shown after a save on Settings too: the page data reloads and reports the stored key. -->
{#if hasKey}
	<p>{m.keyStatus()}</p>
{/if}

<p role="status" tabindex="-1" bind:this={statusElement}>{statusMessage}</p>

{#if success}
	<a href={resolve('comic/create')}>{m.createNewComic()}</a>
{:else}
	<form
		data-testId={loginFormTestId}
		method="POST"
		action={`?/${BYOK_ACTION}`}
		use:enhance={handleSubmit}
	>
		<label>
			<span>{m.byok()}</span>
			<input
				type="text"
				name="key"
				autocomplete="off"
				placeholder={m.keyPlaceholder()}
				aria-invalid={fieldErrors.key ? 'true' : undefined}
				aria-describedby={describedBy(['key-hint'], 'key-error', fieldErrors.key)}
			/>
		</label>
		<p id="key-hint">{m.keyHint()}</p>
		<FieldError id="key-error" message={fieldErrors.key} />

		<button type="submit">{m.add()}</button>
	</form>
{/if}
