import CreatePanel from '$lib/components/forms/createPanelForm/CreatePanelForm.svelte';

import { render } from '@testing-library/svelte';
import { CreatePanelFormPropsMock } from './mockcreatePanelForm';

export function renderCreatePanelForm(props = CreatePanelFormPropsMock[0]) {
	const { getByRole } = render(CreatePanel, props);

	return {
		getButton: () => getByRole('button', { name: props.label }),
		props,
	};
}
