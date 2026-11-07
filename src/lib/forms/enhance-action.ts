import { globalError } from '$lib/utils/states/error.svelte';
import { globalLoading } from '$lib/utils/states/loading.svelte';
import type { SubmitFunction } from '@sveltejs/kit';
import { toFormFailure, type FormFailure } from './form-failure';

export type UpdateForm = () => Promise<void>;

export type ActionSuccessHandler<T> = (parameters: {
	data: T;
	update: UpdateForm;
}) => Promise<void> | void;

export function enhanceAction<T extends Record<string, unknown>>(
	onSuccess: ActionSuccessHandler<T>,
	options: { onFailure?: (failure: FormFailure) => void } = {},
): SubmitFunction<T> {
	let inFlight = false;

	return ({ cancel }) => {
		if (inFlight) {
			cancel();
			return;
		}

		inFlight = true;
		globalError.reset();
		globalLoading.start();

		return async ({ result, update }) => {
			try {
				if (result.type === 'success' && result.data !== undefined) {
					await onSuccess({ data: result.data as T, update });
				} else if (result.type === 'error') {
					globalError.set(result.error.message);
				} else if (result.type === 'failure') {
					const failure = toFormFailure(result.data);
					if (options.onFailure) {
						options.onFailure(failure);
					} else {
						globalError.set(failure.message);
					}
				}
			} catch (error) {
				globalError.set(error instanceof Error ? error.message : 'Submission failed');
			} finally {
				inFlight = false;
				globalLoading.stop();
			}
		};
	};
}
