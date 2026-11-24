<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { deleteItemWithAssets } from '#lib/features/comics/client/workflows/delete-item.ts';
	import {
		DELETE_ITEM_ACTION,
		getDeleteValues,
	} from '#lib/features/comics/contracts/deleteItem.ts';
	import DangerButton from '#lib/components/dangerButton/DangerButton.svelte';
	import { enhanceClientCommand } from '#lib/forms/enhance-client-command.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { DeleteItemFormProps } from './deleteItemFormTypes';

	let {
		label,
		values,
		onSuccess,
		iconOnly = false,
		danger = false,
	}: DeleteItemFormProps = $props();

	const handleSubmit = enhanceClientCommand(
		m.loadingDelete(),
		getDeleteValues,
		async (values) => {
			const cleanup = await deleteItemWithAssets(workflowDeps, values);
			if (!cleanup.ok) {
				console.warn('Could not remove obsolete assets', cleanup.failed);
			}
		},
		async ({ update }) => {
			await update();
			onSuccess?.();
		},
	);
</script>

<form method="POST" action={`?/${DELETE_ITEM_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	{#if iconOnly}
		<button type="submit" class="icon-only" aria-label={label}>
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path
					d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	{:else}
		{#if danger}
			<DangerButton>{label}</DangerButton>
		{:else}
			<button type="submit">{label}</button>
		{/if}
	{/if}
</form>

<style>
	.icon-only {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-inline-size: var(--control-min-size);
		min-block-size: var(--control-min-size);
		color: var(--color-danger);
		background: transparent;
		border: var(--border-width) solid var(--color-control-border);
		border-radius: var(--radius);
	}

	.icon-only svg {
		inline-size: var(--icon-size);
		block-size: var(--icon-size);
	}
</style>
