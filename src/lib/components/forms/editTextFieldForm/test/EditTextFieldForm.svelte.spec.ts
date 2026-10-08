import { fireEvent } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { renderEditTextFieldForm } from './utils/renderEditTextFieldForm';

describe('TextFieldForm', () => {
	it('should show value', () => {
		const { getTextValue, props } = renderEditTextFieldForm();

		expect(getTextValue()).toHaveTextContent(props.visibleText);
	});

	it('should show text field', async () => {
		const { getInputField, getEditButton, getSaveButton, props } = renderEditTextFieldForm();

		await fireEvent.click(getEditButton());

		expect(getInputField()).toHaveValue(props.values.value);
		expect(getSaveButton()).toBeInTheDocument();
	});

	it('should hide text field on cancel', async () => {
		const { getTextValue, getEditButton, queryInputField, getCancelButton, props } =
			renderEditTextFieldForm();

		await fireEvent.click(getEditButton());
		await fireEvent.click(getCancelButton());

		expect(getTextValue()).toHaveTextContent(props.visibleText);
		expect(queryInputField()).not.toBeInTheDocument();
	});
});
