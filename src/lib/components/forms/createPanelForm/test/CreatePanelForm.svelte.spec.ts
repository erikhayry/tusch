import { describe, expect, it } from 'vitest';
import { renderCreatePanelForm } from './utils/renderCreatePanelForm';

describe('CreatePanelForm', () => {
	it('should render button', () => {
		const { getButton } = renderCreatePanelForm();

		expect(getButton()).toBeInTheDocument();
	});
});
