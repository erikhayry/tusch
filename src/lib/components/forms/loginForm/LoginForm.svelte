<script lang="ts" module>
	export const loginFormTestId = 'loginform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';

	import { m } from '$lib/paraglide/messages';

	import { ACTION } from '$lib/utils/actions';
	import type { SubmitFunction } from '@sveltejs/kit';

	let success = $state<boolean | null>(null);

	const handleSubmit: SubmitFunction = () => {
		return ({ result }) => {
			success = result.status === 200;
		};
	};
</script>

{#if success}
	<p>{m.keyAdded()}</p>
{:else if success === false}
	<p>{m.keyFailed()}</p>
{:else}
	<form
		data-testId={loginFormTestId}
		method="POST"
		action={`?/${ACTION.BYOK}`}
		use:enhance={handleSubmit}
	>
		<label>
			<span>{m.byok()}</span>
			<input type="text" name="key" autocomplete="off" />
		</label>

		<button type="submit">{m.add()}</button>
	</form>
{/if}
