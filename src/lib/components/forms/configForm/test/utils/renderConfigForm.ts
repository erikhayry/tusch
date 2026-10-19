import ConfigForm from '$lib/components/forms/configForm/ConfigForm.svelte';
import { ConfigFormPropsMock } from '$lib/components/forms/configForm/test/utils/mockconfigForm';
import { m } from '$lib/paraglide/messages';
import { render, within } from '@testing-library/svelte';

export function renderConfigForm(props = ConfigFormPropsMock[0]) {
	const { getByRole } = render(ConfigForm, props);

	const getModels = () => getByRole('combobox', { name: m.selectModel() });
	const getConfigValues = () => getByRole('list', { name: m.currentConfig() });

	return {
		getTitle: () => getByRole('heading', { name: m.config(), level: 2 }),
		getModels,
		getModelItems: () => within(getModels()).getAllByRole('option'),
		getConfig: (name: string) => within(getConfigValues()).getByRole('listitem', { name }),
		props,
	};
}
