import { render } from '@testing-library/svelte';
import Setting from '../../Setting.svelte';
import { SettingPropsMock } from './mockSetting';

export function renderSetting(props = SettingPropsMock) {
	const { getAllByRole } = render(Setting, { props });

	return {
		props,
		getYears: () => getAllByRole('listitem')
	};
}
