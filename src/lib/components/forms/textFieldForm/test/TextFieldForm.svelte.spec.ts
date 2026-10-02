import { renderTextFieldForm } from '$lib/components/forms/textFieldForm/test/utils/renderTextFieldForm';
import { fireEvent } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('TextFieldForm', () => {
	it('should show value', () => {
		const { getTextValue, props } = renderTextFieldForm();

		expect(getTextValue()).toHaveTextContent(props.values.value);
	});

	it('should show text field', async () => {
		const { getInputField, getEditButton, getSaveButton, props } = renderTextFieldForm();

		await fireEvent.click(getEditButton());

		expect(getInputField()).toHaveValue(props.values.value);
		expect(getSaveButton()).toBeInTheDocument();
	});

	it('should hide text field on cancel', async () => {
		const { getTextValue, getEditButton, queryInputField, getCancelButton, props } =
			renderTextFieldForm();

		await fireEvent.click(getEditButton());
		await fireEvent.click(getCancelButton());

		expect(getTextValue()).toHaveTextContent(props.values.value);
		expect(queryInputField()).not.toBeInTheDocument();
	});
});
