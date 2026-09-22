<script lang="ts">
	import type { SettingProps } from './settingTypes';
	import { SettingTestId } from './settingValues';

	let props: SettingProps = $props();
</script>

<h2 data-testid={SettingTestId}>Setting</h2>

<h2 id="years">Years</h2>
<ul aria-labelledby="years">
	{#each props.setting.years as year (year)}
		<li>{year}</li>
	{/each}
</ul>
