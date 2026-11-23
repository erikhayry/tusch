<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ConfigForm from '#lib/components/forms/configForm/ConfigForm.svelte';
	import GlobalInstructionsForm from '#lib/components/forms/globalInstructionsForm/GlobalInstructionsForm.svelte';
	import LoginForm from '#lib/components/forms/loginForm/LoginForm.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { Props } from './+page';

	let { data }: { data: Props } = $props();
	const { config, hasKey, ...models } = $derived(data);
</script>

<Page title={m.settings()}>
	<!-- A saved key changes the model lists and the hints, which come from the page load. -->
	<LoginForm {hasKey} onSaved={refreshAll} />
	<ConfigForm {models} {config} {hasKey} />
	<GlobalInstructionsForm />
	<a href={resolve('')}>{m.back()}</a>
</Page>
