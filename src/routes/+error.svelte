<script lang="ts">
	import { page } from '$app/state';
	import Page from '$lib/components/page/Page.svelte';
</script>

<!-- Same markup as SvelteKit's default error page, inside Page for the title and landmark. -->
<Page title={String(page.status)}>
	<p>{page.error?.message}</p>
</Page>
