import { renderConfigForm } from '$lib/components/forms/configForm/test/utils/renderConfigForm';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import { describe, expect, it } from 'vitest';

describe('ConfigForm', () => {
	it('should render title', () => {
		const { getTitle } = renderConfigForm();

		expect(getTitle()).toBeInTheDocument();
	});

	it('should render current config', () => {
		const { getConfig, props } = renderConfigForm();
		const textModel = props.config[TEXT_MODEL_KEY];
		const imageModel = props.config[IMAGE_MODEL_KEY];

		if (textModel === undefined || imageModel === undefined) {
			throw new Error('Config fixture must include both model values');
		}

		expect(getConfig(TEXT_MODEL_KEY)).toHaveTextContent(textModel);
		expect(getConfig(IMAGE_MODEL_KEY)).toHaveTextContent(imageModel);
	});

	it('should render available text models', () => {
		const { getTextModels, getTextModelItems, props } = renderConfigForm();

		expect(getTextModels()).toBeInTheDocument();
		expect(getTextModelItems()).toHaveLength(props.models[TEXT_MODEL_KEY].length);
	});

	it('should render available image models', () => {
		const { getImageModels, getImageModelItems, props } = renderConfigForm();

		expect(getImageModels()).toBeInTheDocument();
		expect(getImageModelItems()).toHaveLength(props.models[IMAGE_MODEL_KEY].length);
	});
});
