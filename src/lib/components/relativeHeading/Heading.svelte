<script lang="ts">
  import { type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getTag } from './utils/headinLevel';

  type Props = HTMLAttributes<HTMLHeadingElement> & {
    children: Snippet;
  };

  let { children, ...restProps }: Props = $props();
</script>

<svelte:element this={getTag()} {...restProps}>
  {@render children()}
</svelte:element>
