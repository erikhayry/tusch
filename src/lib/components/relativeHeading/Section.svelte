<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setLevel } from './utils/headinLevel';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { children, ...props }: Props = $props();

	setLevel();
</script>

<section {...props}>
	{@render children()}
</section>
