<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ConfigForm from '#lib/components/forms/configForm/ConfigForm.svelte';
	import GlobalInstructionsForm from '#lib/components/forms/globalInstructionsForm/GlobalInstructionsForm.svelte';
	import LoginForm from '#lib/components/forms/loginForm/LoginForm.svelte';
	import Page from '#lib/components/page/Page.svelte';
	import Heading from '#lib/components/relativeHeading/Heading.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { Props } from './+page';

	let { data }: { data: Props } = $props();
	const { config, hasKey, ...models } = $derived(data);
</script>

<Page title={m.settings()}>
	<div class="settings">
		<div class="card">
			<Section>
				<div class="card-heading">
					<Heading>{m.keyCardTitle()}</Heading>
					<span class="badge">{hasKey ? m.keyBadgeSaved() : m.keyBadgeMissing()}</span>
				</div>
				<!-- A saved key changes the model lists and the hints, which come from the page load. -->
				<LoginForm {hasKey} onSaved={refreshAll} />
			</Section>
		</div>
		<div class="card">
			<ConfigForm {models} {config} {hasKey} />
		</div>
		<div class="card">
			<GlobalInstructionsForm />
		</div>
		<a href={resolve('')}>{m.back()}</a>
	</div>
</Page>

<style>
	.settings {
		display: grid;
		gap: var(--space-4);
		max-width: var(--width-compact);
	}

	.card {
		padding: var(--space-3);
		background: var(--color-surface);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--card-radius);
	}

	.card-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.badge {
		padding: var(--space-1) var(--space-2);
		font-size: var(--font-size-small);
		border: var(--border-width) solid var(--color-control-border);
		border-radius: var(--radius-pill);
	}
</style>
