<script lang="ts" module>
	export const configFormTestId = 'configform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';

	import Heading from '#lib/components/relativeHeading/Heading.svelte';
	import Section from '#lib/components/relativeHeading/Section.svelte';
	import {
		CONFIG_ACTION,
		type SaveModelSettingsResult,
	} from '#lib/features/settings/contracts/saveModelSettings.ts';
	import { enhanceAction } from '#lib/forms/enhance-action.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '#lib/types/index.ts';

	import { type ConfigFormProps } from './configFormTypes';

	// The server writes both model cookies; the UI only changes once the reloaded
	// page data reflects the committed settings.
	const handleSubmit = enhanceAction<SaveModelSettingsResult>(
		m.loadingSaveSettings(),
		({ update }) => update(),
	);

	let { models, config, hasKey }: ConfigFormProps = $props();
</script>

<Section data-testId={configFormTestId}>
	<Heading>{m.config()}</Heading>

	<Heading id="currentConfig">{m.currentConfig()}</Heading>
	<ul aria-labelledby="currentConfig">
		{#each Object.entries(config) as configEntry (configEntry[0])}
			<li aria-label={configEntry[0]}>{configEntry[1]}</li>
		{/each}
	</ul>

	<!-- Without a key there are no models to choose from, so the controls are disabled and the
		hint is their only description (REQ-300-1). Disabled controls are skipped by Tab. -->
	{#if !hasKey}
		<p id="models-hint">{m.noKeyModelsHint()}</p>
	{/if}

	<form method="POST" action={`?/${CONFIG_ACTION}`} use:enhance={handleSubmit}>
		<label for="select-text-model">{m.selectTextModel()}</label>
		<select
			id="select-text-model"
			name={TEXT_MODEL_KEY}
			disabled={!hasKey}
			aria-describedby={hasKey ? 'text-model-help' : 'models-hint'}
		>
			{#each models[TEXT_MODEL_KEY] as model, index (index)}
				<option value={model} selected={model === config[TEXT_MODEL_KEY]}>{model}</option>
			{/each}
		</select>
		<p id="text-model-help" class="help">{m.textModelHelp()}</p>

		<label for="select-image-model">{m.selectImageModel()}</label>
		<select
			id="select-image-model"
			name={IMAGE_MODEL_KEY}
			disabled={!hasKey}
			aria-describedby={hasKey ? 'image-model-help' : 'models-hint'}
		>
			{#each models[IMAGE_MODEL_KEY] as model, index (index)}
				<option value={model} selected={model === config[IMAGE_MODEL_KEY]}>{model}</option>
			{/each}
		</select>
		<p id="image-model-help" class="help">{m.imageModelHelp()}</p>

		<button type="submit" disabled={!hasKey}>{m.saveConfig()}</button>
	</form>
</Section>

<style>
	.help {
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
</style>
