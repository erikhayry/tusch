<script lang="ts">
	import Page from '$lib/components/page/Page.svelte';
	import { m } from '$lib/paraglide/messages';

	import type { PageProps } from './$types';

	let { data, form, loading }: PageProps = $props();
</script>

<Page title={m.createNewComic()}>
	{#if form?.success}
		<p>Url {data.url}</p>
	{:else}
		<form method="post">
			<label>
				Url to source
				<input
					type="text"
					name="url"
					placeholder="https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna"
				/>
			</label>
			<button type="submit">Create</button>
		</form>
	{/if}
</Page>
