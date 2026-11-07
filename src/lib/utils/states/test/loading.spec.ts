import { describe, expect, it } from 'vitest';
import { LoadingState } from '../loading.svelte';

describe('LoadingState', () => {
	it('stays loading until every started request has stopped', () => {
		const loading = new LoadingState();

		loading.start();
		loading.start();
		loading.stop();
		expect(loading.isLoading).toBe(true);

		loading.stop();
		expect(loading.isLoading).toBe(false);
	});

	it('never goes below zero', () => {
		const loading = new LoadingState();

		loading.stop();
		expect(loading.isLoading).toBe(false);

		loading.start();
		expect(loading.isLoading).toBe(true);
	});
});
