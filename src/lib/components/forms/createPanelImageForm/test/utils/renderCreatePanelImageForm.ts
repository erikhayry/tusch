import CreatePanelImageForm from '$lib/components/forms/createPanelImageForm/CreatePanelImageForm.svelte';
import { CreatePanelImageFormPropsMock } from '$lib/components/forms/createPanelImageForm/test/utils/mockCreatePanelImageForm';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderCreatePanelImageForm(props = CreatePanelImageFormPropsMock[0]) {
	const { getByRole, findByRole, queryByRole } = render(CreatePanelImageForm, props);

	return {
		getButton: () => getByRole('button', { name: props.label }),
		getPrompt: () => getByRole('textbox', { name: m.instructions() }),
		findIncludeImageCheckbox: () => findByRole('checkbox', { name: m.includeImage() }),
		queryIncludeImageCheckbox: () => queryByRole('checkbox', { name: m.includeImage() }),
		props,
	};
}
