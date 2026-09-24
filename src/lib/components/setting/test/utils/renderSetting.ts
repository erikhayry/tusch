import { render, within } from '@testing-library/svelte';
import Setting from '../../Setting.svelte';
import { SettingPropsMock } from './mockSetting';
import { m } from '$lib/paraglide/messages';

export function renderSetting(props = SettingPropsMock) {
	const { getByRole } = render(Setting, { props });

	return {
		props,
    getYears: () => within(getByRole('list', { name: m.years()})).getAllByRole('listitem'),
    getSeasons: () => within(getByRole('list', { name: m.seasons()})).getAllByRole('listitem'),
	};
}
