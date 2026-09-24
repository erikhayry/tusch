<script module>
	export const TestId = 'Setting';
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	import type { SettingProps } from './settingTypes';

	let props: SettingProps = $props();
</script>


<h2 data-testid={TestId}>Setting</h2>

<h2 id="years">{m.years()}</h2>
<ul aria-labelledby="years">
	{#each props.setting.years as year (year)}
		<li>{year}</li>
	{/each}
</ul>

<h2 id="seasons">{m.seasons()}</h2>
<ul aria-labelledby="seasons">
	{#each props.setting.seasons as season, index (index)}
	<li>{season}</li>
	{/each}
</ul>
