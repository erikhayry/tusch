import { renderCreateImageForm } from '$lib/components/forms/createImageForm/test/utils/renderCreateImageForm';
import { describe, expect, it } from 'vitest';

describe('CreateImageForm', () => {
	it('should render button', () => {
		const { getButton } = renderCreateImageForm();

		expect(getButton()).toBeInTheDocument();
	});

	it('should render prompt', () => {
		const { getPrompt } = renderCreateImageForm();

		expect(getPrompt()).toBeInTheDocument();
	});
});
