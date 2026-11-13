<script lang="ts" module>
	export const loaderTestId = 'loader-test-id';
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { globalLoading } from '$lib/utils/states/loading.svelte';

	const labelId = $props.id();
</script>

<div data-testId={loaderTestId}>
	<!-- Only the label and "Done" are announced; the ticking seconds stay outside the live region. -->
	<div aria-live="polite" role="status">
		{#if globalLoading.isLoading}
			<span id={labelId}>{globalLoading.label}</span>
		{:else if globalLoading.succeeded}
			<span class="visually-hidden">{m.done()}</span>
		{/if}
	</div>
	<!-- A named landmark (satisfies axe `region`), rendered only while running. Not a live region, so the ticking seconds are never announced. -->
	{#if globalLoading.isLoading}
		<section aria-labelledby={labelId}>
			<progress aria-labelledby={labelId}></progress>
			<span>{m.elapsedSeconds({ seconds: globalLoading.elapsedSeconds })}</span>
		</section>
	{/if}
</div>

<style>
	section {
		max-inline-size: var(--content-width);
		margin-inline: auto;
		padding-inline: var(--space-3);
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
</style>
