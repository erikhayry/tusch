<script lang="ts">
	import ConfigForm from '$lib/components/forms/configForm/ConfigForm.svelte';
	import LoginForm from '$lib/components/forms/loginForm/LoginForm.svelte';
	import Page from '$lib/components/page/Page.svelte';
	import { getConfig } from '$lib/utils/db/db.svelte';
	import type { Props } from './+page';

	let { data }: { data: Props } = $props();
	let config = getConfig();
</script>

<Page title="TODO">
	<LoginForm />
	<ConfigForm models={data.models} {config} />
</Page>
