import { renderError } from '$lib/components/error/test/utils/renderError';
import { globalError } from '$lib/utils/states/error.svelte';
import { describe, expect, it } from 'vitest';

describe('Error', () => {
	it('should render error', () => {
		globalError.set('Error message');

		const { getError, getErrorMessage } = renderError();

		expect(getError()).toBeInTheDocument();
		expect(getErrorMessage('Error message')).toBeInTheDocument();
	});

	it('should not render error', () => {
		globalError.reset();

		const { queryError } = renderError();

		expect(queryError()).not.toBeInTheDocument();
	});
});
