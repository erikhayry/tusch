import { renderCreatePanelImageForm } from '$lib/components/forms/createPanelImageForm/test/utils/renderCreatePanelImageForm';
import { describe, expect, it } from 'vitest';
import { CreatePanelImageFormPropsMock } from './utils/mockCreatePanelImageForm';

describe('CreateImageForm', () => {
	it('should render button', () => {
		const { getButton } = renderCreatePanelImageForm();

		expect(getButton()).toBeInTheDocument();
	});

	it('should render prompt', () => {
		const { getPrompt } = renderCreatePanelImageForm();

		expect(getPrompt()).toBeInTheDocument();
	});

	it('should not render attach image option when imageName is undefined', async () => {
		const { queryIncludeImageCheckbox } = renderCreatePanelImageForm({
			...CreatePanelImageFormPropsMock[0],
			imageName: undefined,
		});

		expect(queryIncludeImageCheckbox()).not.toBeInTheDocument();
	});

	it('should render attach image option when imageName is defined', async () => {
		const { findIncludeImageCheckbox } = renderCreatePanelImageForm({
			...CreatePanelImageFormPropsMock[0],
			imageName: 'ImageName',
		});

		expect(await findIncludeImageCheckbox()).toBeInTheDocument();
	});
});
