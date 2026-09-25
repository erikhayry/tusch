<script module>
	export const TestId = 'Setting';
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Heading from '../relativeHeading/Heading.svelte';
	import Section from '../relativeHeading/Section.svelte';

	import type { SettingProps } from './settingTypes';

	let props: SettingProps = $props();
</script>

<Section>
	<Heading data-testid={TestId}>Setting</Heading>

	<Section>
		<Heading id="years">{m.years()}</Heading>
		<ul aria-labelledby="years">
			{#each props.setting.years as year, index (index)}
				<li>{year}</li>
			{/each}
		</ul>

		<Heading id="seasons">{m.seasons()}</Heading>
		<ul aria-labelledby="seasons">
			{#each props.setting.seasons as season, index (index)}
				<li>{season}</li>
			{/each}
		</ul>

		<Heading id="time-of-day">{m.timeOfDay()}</Heading>
		<ul aria-labelledby="time-of-day">
			{#each props.setting.timeOfDays as timeOfDay, index (index)}
				<li>{timeOfDay}</li>
			{/each}
		</ul>

		<Heading id="locations">{m.locations()}</Heading>
		<ul aria-labelledby="locations">
			{#each props.setting.locations as place, index (index)}
				<li>{place}</li>
			{/each}
		</ul>
	</Section>
</Section>
