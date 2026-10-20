import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
import { globalError } from '../states/error.svelte';
import { globalLoading } from '../states/loading.svelte';

export function onSubmit<T extends Record<string, unknown> | undefined>(
	onSuccess: (parameters: {
		update: () => Promise<void>;
		result: Extract<ActionResult<T, Record<string, unknown>>, { type: 'success' }>;
	}) => Promise<void> | void,
): SubmitFunction<T> {
	return async () => {
		globalError.reset();
		globalLoading.start();
		return async ({ result, update }) => {
			try {
				if (result.type === 'success' && result.data !== undefined) {
					await onSuccess({
						update,
						result,
					});
				} else if (result.type === 'error') {
					globalError.set(result.error.message);
				} else if (result.type === 'failure' && result.data !== undefined) {
					const failureData = result.data as Record<string, unknown>;
					const message =
						typeof failureData.message === 'string' ? failureData.message : 'Submission failed';
					globalError.set(message);
				}
			} finally {
				globalLoading.stop();
			}
		};
	};
}
