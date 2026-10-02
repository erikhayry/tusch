import { renderRemoveFieldItemForm } from '$lib/components/forms/deleteItemForm/test/utils/renderRemoveFieldItemForm';
import { describe, expect, it } from 'vitest';

describe('DeleteItemForm', () => {
	it('should show button', () => {
		const { getDeleteButton } = renderRemoveFieldItemForm();

		expect(getDeleteButton()).toBeInTheDocument();
	});
});
