<script lang="ts" module>
	export const configFormTestId = 'configform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';

	import Heading from '$lib/components/relativeHeading/Heading.svelte';
	import Section from '$lib/components/relativeHeading/Section.svelte';
	import { m } from '$lib/paraglide/messages';
	import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
	import { ACTION } from '$lib/utils/actions/actions';
	import { onEdit } from '$lib/utils/actions/onEdit';
	import { addImageModel, addTextModel } from '$lib/utils/db/db.svelte';
	import type { ConfigValues } from '$lib/utils/db/dbTypes';
	import { getConfigValues } from '../utils/values';
	import { type ConfigFormProps } from './configFormTypes';

	const handleSubmit = onEdit(getConfigValues, (values: ConfigValues) => {
		if (values[IMAGE_MODEL_KEY]) {
			addImageModel(values[IMAGE_MODEL_KEY]);
		}
		if (values[TEXT_MODEL_KEY]) {
			addTextModel(values[TEXT_MODEL_KEY]);
		}
	});

	let { models, config }: ConfigFormProps = $props();
</script>

<Section data-testId={configFormTestId}>
	<Heading>{m.config()}</Heading>

	<Heading id="currentConfig">{m.currentConfig()}</Heading>
	<ul aria-labelledby="currentConfig">
		{#each Object.entries(config) as configEntry (configEntry[1])}
			<li aria-label={configEntry[0]}>{configEntry[1]}</li>
		{/each}
	</ul>

	<form method="POST" action={`?/${ACTION.CONFIG}`} use:enhance={handleSubmit}>
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
