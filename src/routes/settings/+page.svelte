<script lang="ts">
	import { resolve } from '$app/paths';
	import ConfigForm from '$lib/components/forms/configForm/ConfigForm.svelte';
	import GlobalInstructionsForm from '$lib/components/forms/globalInstructionsForm/GlobalInstructionsForm.svelte';
	import LoginForm from '$lib/components/forms/loginForm/LoginForm.svelte';
	import Page from '$lib/components/page/Page.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { Props } from './+page';

	let { data }: { data: Props } = $props();
	const { config, ...models } = $derived(data);
</script>

<Page title={m.settings()}>
	<LoginForm />
	<ConfigForm {models} {config} />
	<GlobalInstructionsForm />
	<a href={resolve('/')}>{m.back()}</a>
</Page>
