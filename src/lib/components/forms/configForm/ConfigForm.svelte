<script lang="ts" module>
	export const configFormTestId = 'configform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';

	import Heading from '$lib/components/relativeHeading/Heading.svelte';
	import Section from '$lib/components/relativeHeading/Section.svelte';
	import {
		CONFIG_ACTION,
		type SaveModelSettingsResult,
	} from '$lib/features/settings/contracts/saveModelSettings';
	import { enhanceAction } from '$lib/forms/enhance-action';
	import { m } from '$lib/paraglide/messages';
	import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';

	import { type ConfigFormProps } from './configFormTypes';

	// The server writes both model cookies; the UI only changes once the reloaded
	// page data reflects the committed settings.
	const handleSubmit = enhanceAction<SaveModelSettingsResult>(
		m.loadingSaveSettings(),
		({ update }) => update(),
	);

	let { models, config }: ConfigFormProps = $props();
</script>

<Section data-testId={configFormTestId}>
	<Heading>{m.config()}</Heading>

	<Heading id="currentConfig">{m.currentConfig()}</Heading>
	<ul aria-labelledby="currentConfig">
		{#each Object.entries(config) as configEntry (configEntry[0])}
			<li aria-label={configEntry[0]}>{configEntry[1]}</li>
		{/each}
	</ul>

	<form method="POST" action={`?/${CONFIG_ACTION}`} use:enhance={handleSubmit}>
		<label for="select-text-model">{m.selectTextModel()}</label>
		<select id="select-text-model" name={TEXT_MODEL_KEY}>
			{#each models[TEXT_MODEL_KEY] as model, index (index)}
				<option value={model} selected={model === config[TEXT_MODEL_KEY]}>{model}</option>
			{/each}
		</select>
		<label for="select-textmodels">{m.selectImageModel()}</label>
		<select id="select-textmodels" name={IMAGE_MODEL_KEY}>
			{#each models[IMAGE_MODEL_KEY] as model, index (index)}
				<option value={model} selected={model === config[IMAGE_MODEL_KEY]}>{model}</option>
			{/each}
		</select>
		<button type="submit">{m.saveConfig()}</button>
	</form>
</Section>
