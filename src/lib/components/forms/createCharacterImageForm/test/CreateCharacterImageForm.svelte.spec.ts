import { renderCreateCharacterImageForm } from '$lib/components/forms/createCharacterImageForm/test/utils/renderCreateCharacterImageForm';
import { describe, expect, it } from 'vitest';

describe('CreateCharacterImageForm', () => {
	it('should render name', () => {
		const { getSubmitButton } = renderCreateCharacterImageForm();

		expect(getSubmitButton()).toBeInTheDocument();
	});
});
