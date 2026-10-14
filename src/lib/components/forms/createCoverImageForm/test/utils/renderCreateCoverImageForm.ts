import CreateImageForm from '$lib/components/forms/createCoverImageForm/CreateCoverImageForm.svelte';
import { CreateCoverImageFormPropsMock } from '$lib/components/forms/createCoverImageForm/test/utils/mockCreateImageCoverForm';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderCreateCoverImageForm(props = CreateCoverImageFormPropsMock[0]) {
	const { getByRole, findByRole, queryByRole } = render(CreateImageForm, props);

	return {
		getButton: () => getByRole('button', { name: props.label }),
		getPrompt: () => getByRole('textbox', { name: m.instructions() }),
		findIncludeImageCheckbox: () => findByRole('checkbox', { name: m.includeImage() }),
		queryIncludeImageCheckbox: () => queryByRole('checkbox', { name: m.includeImage() }),
		props,
	};
}
