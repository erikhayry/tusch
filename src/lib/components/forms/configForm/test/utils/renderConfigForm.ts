import ConfigForm from '$lib/components/forms/configForm/ConfigForm.svelte';
import { ConfigFormPropsMock } from '$lib/components/forms/configForm/test/utils/mockconfigForm';
import { m } from '$lib/paraglide/messages';
import { render, within } from '@testing-library/svelte';

export function renderConfigForm(props = ConfigFormPropsMock[0]) {
	const { getByRole } = render(ConfigForm, props);

	const getTextModels = () => getByRole('combobox', { name: m.selectTextModel() });
	const getImageModels = () => getByRole('combobox', { name: m.selectImageModel() });
	const getConfigValues = () => getByRole('list', { name: m.currentConfig() });

	return {
		getTitle: () => getByRole('heading', { name: m.config(), level: 2 }),
		getTextModels,
		getImageModels,
		getTextModelItems: () => within(getTextModels()).getAllByRole('option'),
		getImageModelItems: () => within(getImageModels()).getAllByRole('option'),
		getConfig: (name: string) => within(getConfigValues()).getByRole('listitem', { name }),
		props,
	};
}
