<script lang="ts">
	import CreateComicForm from '$lib/components/forms/createComicForm/CreateComicForm.svelte';
	import Page from '$lib/components/page/Page.svelte';
	import { m } from '$lib/paraglide/messages';
</script>

<Page title={m.createNewComic()}>
	<CreateComicForm />
</Page>
