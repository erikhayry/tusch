import { renderConfigForm } from '$lib/components/forms/configForm/test/utils/renderConfigForm';
import { describe, expect, it } from 'vitest';

describe('ConfigForm', () => {
	it('should render title', () => {
		const { getTitle } = renderConfigForm();

		expect(getTitle()).toBeInTheDocument();
	});

	it('should render current config', () => {
		const { getConfig, props } = renderConfigForm();

		expect(getConfig('model')).toHaveTextContent(props.config.model);
	});

	it('should render available models', () => {
		const { getModels, getModelItems, props } = renderConfigForm();

		expect(getModels()).toBeInTheDocument();
		expect(getModelItems()).toHaveLength(props.models.length);
	});
});
