<script lang="ts" module>
	export const errorTestId = 'error-test-id';
</script>

<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';

	import { globalError } from '#lib/utils/states/error.svelte.ts';
</script>

<div data-testId={errorTestId} aria-live="polite" role="status">
	{#if globalError.error.isError}
		<p>{m.error()}</p>
		<p>{globalError.error.message}</p>
		{#if globalError.error.details}
			<details>
				<summary>{m.showDetails()}</summary>
				<p>{globalError.error.details}</p>
			</details>
		{/if}
	{/if}
</div>

<style>
	/* An empty region is 0 px tall. Never hide it (display/visibility): a live
	   region must stay in the accessibility tree for its changes to be announced. */
	[role='status'] {
		max-inline-size: var(--width-content);
		margin-inline: auto;
		padding-inline: var(--space-3);
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}

	@media (min-width: 48em) {
		[role='status'] {
			padding-inline: var(--space-5);
		}
	}
</style>
