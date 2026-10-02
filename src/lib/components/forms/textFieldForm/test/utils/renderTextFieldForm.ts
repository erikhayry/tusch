import { TextFieldFormPropsMock } from '$lib/components/forms/textFieldForm/test/utils/mocktextFieldForm';
import TextFieldForm from '$lib/components/forms/textFieldForm/TextFieldForm.svelte';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderTextFieldForm(
	props = {
		...TextFieldFormPropsMock[0],
		values: { ...TextFieldFormPropsMock[0].values, value: 'VALUE' },
	},
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
