import { renderCreateCoverImageForm } from '$lib/components/forms/createCoverImageForm/test/utils/renderCreateCoverImageForm';
import { describe, expect, it } from 'vitest';
import { CreateCoverImageFormPropsMock } from './utils/mockCreateImageCoverForm';

describe('CreateCoverImageForm', () => {
	it('should render button', () => {
		const { getButton } = renderCreateCoverImageForm();

		expect(getButton()).toBeInTheDocument();
	});

	it('should render prompt', () => {
		const { getPrompt } = renderCreateCoverImageForm();

		expect(getPrompt()).toBeInTheDocument();
	});

	it('should not render attach image option when imageName is undefined', async () => {
		const { queryIncludeImageCheckbox } = renderCreateCoverImageForm({
			...CreateCoverImageFormPropsMock[0],
			imageName: undefined,
		});

		expect(queryIncludeImageCheckbox()).not.toBeInTheDocument();
	});

	it('should render attach image option when imageName is defined', async () => {
		const { findIncludeImageCheckbox } = renderCreateCoverImageForm({
			...CreateCoverImageFormPropsMock[0],
			imageName: 'ImageName',
		});

		expect(await findIncludeImageCheckbox()).toBeInTheDocument();
	});
});
