import type { SubmitFunction } from '@sveltejs/kit';
import { globalError } from '../states/error.svelte';
import { globalLoading } from '../states/loading.svelte';

export function onSubmit<T extends Record<string, unknown> | undefined>(
	onSuccess: (data: T) => void,
): SubmitFunction<T> {
	return async () => {
		globalError.reset();
		globalLoading.start();

		return async ({ result }) => {
			try {
				if (result.type === 'success' && result.data) {
					onSuccess(result.data as T);
				} else if (result.type === 'error') {
					globalError.set(result.error.message);
				} else if (result.type === 'failure' && result.data) {
					globalError.set(result.data.message ?? 'Submission failed');
				}
			} finally {
				globalLoading.stop();
			}
		};
	};
}
