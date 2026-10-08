import { renderLoader } from '$lib/components/loader/test/utils/renderLoader';
import { globalLoading } from '$lib/utils/states/loading.svelte';
import { describe, expect, it } from 'vitest';

describe('Loader', () => {
	it('should show loading text', () => {
		globalLoading.start();
		const { getLoader } = renderLoader();

		expect(getLoader()).toBeInTheDocument();
	});

	it('should hide loading text', () => {
		globalLoading.stop();
		const { queryLoader } = renderLoader();

		expect(queryLoader()).not.toBeInTheDocument();
	});
});
