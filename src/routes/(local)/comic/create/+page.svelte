<script lang="ts">
	import CreateComicForm from '#lib/components/forms/createComicForm/CreateComicForm.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import { localizedHref } from '#lib/components/header/header-navigation.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { resolve } from '$app/paths';
</script>

<!-- The back link sits above the heading, so the page places its own <h1> (Page's default would come first). -->
<Page title={m.createNewComic()} showTitle={false}>
	<a class="back" href={resolve(localizedHref('/'))}
		><span aria-hidden="true">←</span> {m.backToComics()}</a
	>
	<h1>{m.createNewComic()}</h1>
	<CreateComicForm />
</Page>

<style>
	.back {
		display: inline-block;
		margin-block: 0 var(--space-3);
	}
</style>
