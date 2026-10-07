<script lang="ts">
	import { enhance } from '$app/forms';
	import { ACTION } from '$lib/utils/actions';
	import { addPanel } from '$lib/utils/db/db';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { type CreatePanelFormProps } from './createPanelFormTypes';

	let isLoading = $state(false);

	const handleSubmit: SubmitFunction = async () => {
		isLoading = true;

		return async ({ update, result }) => {
			try {
				if (result.type === 'success' && result.data) {
					const { comicId, panel, index } = result.data;
					addPanel(comicId, panel, index);
				}
				await update();
			} finally {
				isLoading = false;
			}
		};
	};

	let { label, values }: CreatePanelFormProps = $props();
</script>

{#if isLoading}
	<p>Is loading...</p>
{/if}

<form method="POST" action={`?/${ACTION.CREATE_PANEL}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	<button type="submit">{label}</button>
</form>
