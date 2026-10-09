import CreateImageForm from '$lib/components/forms/createImageForm/CreateImageForm.svelte';
import { CreateImageFormPropsMock } from '$lib/components/forms/createImageForm/test/utils/mockcreateImageForm';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderCreateImageForm(props = CreateImageFormPropsMock[0]) {
	const { getByRole } = render(CreateImageForm, props);

	return {
		getButton: () => getByRole('button', { name: props.label }),
		getPrompt: () => getByRole('textbox', { name: m.instructions() }),
		props,
	};
}
