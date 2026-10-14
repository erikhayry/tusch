import { renderCreateImageForm } from '$lib/components/forms/createImageForm/test/utils/renderCreateImageForm';
import { describe, expect, it } from 'vitest';
import { CreateImageFormPropsMock } from './utils/mockcreateImageForm';

describe('CreateImageForm', () => {
	it('should render button', () => {
		const { getButton } = renderCreateImageForm();

		expect(getButton()).toBeInTheDocument();
	});

	it('should render prompt', () => {
		const { getPrompt } = renderCreateImageForm();

		expect(getPrompt()).toBeInTheDocument();
	});

	it('should not render attach image option when imageName is undefined', async () => {
		const { queryIncludeImageCheckbox } = renderCreateImageForm({
			...CreateImageFormPropsMock[0],
			imageName: undefined,
		});

		expect(queryIncludeImageCheckbox()).not.toBeInTheDocument();
	});

	it('should render attach image option when imageName is defined', async () => {
		const { findIncludeImageCheckbox } = renderCreateImageForm({
			...CreateImageFormPropsMock[0],
			imageName: 'ImageName',
		});

		expect(await findIncludeImageCheckbox()).toBeInTheDocument();
	});
});
