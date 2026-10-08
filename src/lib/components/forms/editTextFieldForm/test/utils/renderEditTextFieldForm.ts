import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';
import EditTextFieldForm from '../../EditTextFieldForm.svelte';
import { EditTextFieldFormPropsMock } from './mockEditTextFieldForm';

export function renderEditTextFieldForm(
	props = {
		...EditTextFieldFormPropsMock[0],
		values: { ...EditTextFieldFormPropsMock[0].values, value: 'VALUE' },
	},
) {
	const { getByRole, queryByRole } = render(EditTextFieldForm, props);

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
