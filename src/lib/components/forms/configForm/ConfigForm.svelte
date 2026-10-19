<script lang="ts" module>
	export const configFormTestId = 'configform-test-id';
</script>

<script lang="ts">
	import { enhance } from '$app/forms';

	import Heading from '$lib/components/relativeHeading/Heading.svelte';
	import Section from '$lib/components/relativeHeading/Section.svelte';
	import { m } from '$lib/paraglide/messages';
	import { ACTION } from '$lib/utils/actions/actions';
	import { onEdit } from '$lib/utils/actions/onEdit';
	import { addModel } from '$lib/utils/db/db.svelte';
	import type { ConfigValues } from '$lib/utils/db/dbTypes';
	import { getConfigValues } from '../utils/values';
	import { type ConfigFormProps } from './configFormTypes';

	const handleSubmit = onEdit(getConfigValues, (values: ConfigValues) => {
		if (values.model) {
			addModel(values.model);
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

	<form method="POST" action={`?/${ACTION.CLIENT}`} use:enhance={handleSubmit}>
		<label for="select-models">{m.selectModel()}</label>
		<select id="select-models" name="model">
			{#each models as model, index (index)}
				<option value={model}>{model}</option>
			{/each}
		</select>
		<button type="submit">{m.saveConfig()}</button>
	</form>
</Section>
