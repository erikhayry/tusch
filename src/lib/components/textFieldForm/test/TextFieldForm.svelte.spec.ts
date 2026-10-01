import { renderTextFieldForm } from '$lib/components/textFieldForm/test/utils/renderTextFieldForm';
import { fireEvent } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

describe('TextFieldForm', () => {
	it('should show value', () => {
		const { getTextValue, props } = renderTextFieldForm();

		expect(getTextValue()).toHaveTextContent(props.field.value);
	});

	it('should show text field', async () => {
		const { getInputField, getEditButton, getSaveButton, props } = renderTextFieldForm();

		await fireEvent.click(getEditButton());

		expect(getInputField()).toHaveValue(props.field.value);
		expect(getSaveButton()).toBeInTheDocument();
	});
});
