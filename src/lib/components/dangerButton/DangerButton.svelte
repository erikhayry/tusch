<script lang="ts">
	import type { Snippet } from 'svelte';

	// Text button for destructive actions. Shared by every form that removes content, so the
	// danger look is defined once.
	let { children }: { children: Snippet } = $props();
</script>

<button type="submit" class="danger">{@render children()}</button>

<style>
	/* Buttons default to a dark fill, where danger text fails contrast; use the page background. */
	.danger {
		color: var(--color-danger);
		background: var(--color-background);
	}
</style>
