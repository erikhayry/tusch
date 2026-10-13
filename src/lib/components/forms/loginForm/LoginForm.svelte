<script lang="ts" module>
	export const loginFormTestId = 'loginform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	import { m } from '$lib/paraglide/messages';

	import { ACTION } from '$lib/utils/actions/actions';
	import { globalLoading } from '$lib/utils/states/loading.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let success = $state<boolean | null>(null);

	const handleSubmit: SubmitFunction = () => {
		globalLoading.start();
		return ({ result }) => {
			globalLoading.stop();
			if (result.type === 'success') {
				success = Boolean(result.data?.success);
			}
		};
	};
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
