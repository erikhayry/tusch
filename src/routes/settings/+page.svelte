<script lang="ts">
	import ConfigForm from '$lib/components/forms/configForm/ConfigForm.svelte';
	import LoginForm from '$lib/components/forms/loginForm/LoginForm.svelte';
	import Page from '$lib/components/page/Page.svelte';
	import type { Props } from './+page';

	let { data }: { data: Props } = $props();
	const { config, ...models } = $derived(data);
</script>

<Page title="TODO">
	<LoginForm />
	<ConfigForm {models} {config} />
</Page>
