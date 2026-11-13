<script lang="ts" module>
	export const loginFormTestId = 'loginform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	import { m } from '$lib/paraglide/messages';

	import {
		BYOK_ACTION,
		type ValidateApiKeyResult,
	} from '$lib/features/settings/contracts/validateApiKey';
	import { enhanceAction } from '$lib/forms/enhance-action';

	let success = $state<boolean | null>(null);

	// Failures (invalid input, rate limits, provider errors) surface in the global
	// error region via the shared enhancer.
	const handleSubmit = enhanceAction<ValidateApiKeyResult>(m.loadingValidateKey(), ({ data }) => {
		success = data.success;
	});
</script>

{#if success}
	<p>{m.keyAdded()}</p>
	<a href={resolve('/comic/create')}>{m.createNewComic()}</a>
{:else}
	{#if success === false}
		<p>{m.invalidKey()}</p>
	{/if}
	<form
		data-testId={loginFormTestId}
		method="POST"
		action={`?/${BYOK_ACTION}`}
		use:enhance={handleSubmit}
	>
		<label>
			<span>{m.byok()}</span>
			<input type="text" name="key" autocomplete="off" />
		</label>

		<button type="submit">{m.add()}</button>
	</form>
{/if}
