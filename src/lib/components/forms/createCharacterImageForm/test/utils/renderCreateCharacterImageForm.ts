import CreateCharacterImageForm from '$lib/components/forms/createCharacterImageForm/CreateCharacterImageForm.svelte';
import { CreateCharacterImageFormPropsMock } from '$lib/components/forms/createCharacterImageForm/test/utils/mockcreateCharacterImageForm';
import { render } from '@testing-library/svelte';

export function renderCreateCharacterImageForm(props = CreateCharacterImageFormPropsMock[0]) {
	const { getByRole } = render(CreateCharacterImageForm, props);

	return {
		getSubmitButton: () => getByRole('button', { name: props.label }),
		props,
	};
}
