<script lang="ts">
  import { type Snippet } from 'svelte';
  import { setLevel } from './utils/headinLevel';

  let { children }: { children: Snippet } = $props();


  setLevel();
</script>

<section>
  {@render children()}
</section>
