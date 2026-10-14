import CreateImageForm from '$lib/components/forms/createImageForm/CreateImageForm.svelte';
import { CreateImageFormPropsMock } from '$lib/components/forms/createImageForm/test/utils/mockcreateImageForm';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderCreateCoverImageForm(props = CreateImageFormPropsMock[0]) {
	const { getByRole, findByRole, queryByRole } = render(CreateImageForm, props);

	return {
		getButton: () => getByRole('button', { name: props.label }),
		getPrompt: () => getByRole('textbox', { name: m.instructions() }),
		findIncludeImageCheckbox: () => findByRole('checkbox', { name: m.includeImage() }),
		queryIncludeImageCheckbox: () => queryByRole('checkbox', { name: m.includeImage() }),
		props,
	};
}
