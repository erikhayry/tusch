import { renderRemoveFieldItemForm } from '$lib/components/removeFieldItemForm/test/utils/renderRemoveFieldItemForm';
import { describe, expect, it } from 'vitest';

describe('RemoveFieldItemForm', () => {
	it('should show button', () => {
		const { getRemoveButton } = renderRemoveFieldItemForm();

		expect(getRemoveButton()).toBeInTheDocument();
	});
});
