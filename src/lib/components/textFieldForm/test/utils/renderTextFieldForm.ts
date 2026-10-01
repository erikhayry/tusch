import TextFieldForm from '$lib/components/textFieldForm/TextFieldForm.svelte';
import { TextFieldFormPropsMock } from '$lib/components/textFieldForm/test/utils/mocktextFieldForm';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderTextFieldForm(
	props = { ...TextFieldFormPropsMock[0], field: { value: 'VALUE', name: 'NAME' } },
) {
	const { getByRole, queryByRole } = render(TextFieldForm, props);

	return {
		getInputField: () => getByRole('textbox', { name: props.label }),
		queryInputField: () => queryByRole('textbox', { name: props.label }),
		getEditButton: () => getByRole('button', { name: props.editActionLabel }),
		getSaveButton: () => getByRole('button', { name: props.saveActionLabel }),
		getCancelButton: () => getByRole('button', { name: m.cancel() }),
		getTextValue: () => getByRole('paragraph'),
		props,
	};
}
