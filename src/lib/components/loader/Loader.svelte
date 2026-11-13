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
	<!-- Never announces (aria-live off); only gives the bar and timer a container axe's `region` rule accepts. -->
	<div aria-live="off" role="status">
		{#if globalLoading.isLoading}
			<progress aria-labelledby={labelId}></progress>
			<span>{m.elapsedSeconds({ seconds: globalLoading.elapsedSeconds })}</span>
		{/if}
	</div>
</div>
