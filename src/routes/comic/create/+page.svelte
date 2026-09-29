<script lang="ts">
	import { enhance } from '$app/forms';
	import Page from '$lib/components/page/Page.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<Page title={m.createNewComic()}>
	<form method="post" use:enhance>
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
</Page>
