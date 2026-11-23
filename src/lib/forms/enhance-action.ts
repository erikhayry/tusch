import type { SubmitFunction } from '$app/forms';
import { globalError } from '#lib/utils/states/error.svelte.ts';
import { globalLoading } from '#lib/utils/states/loading.svelte.ts';
import { toFormFailure, toUserMessage, type FormFailure } from './form-failure';

export type UpdateForm = () => Promise<void>;

export type ActionSuccessHandler<T> = (parameters: {
	data: T;
	update: UpdateForm;
	/**
	 * Shows an error that doesn't fail the action, e.g. one of two images couldn't be made
	 * and the other was saved (REQ-103-3). Components never set the error state themselves.
	 */
	showError: (message: string) => void;
}) => Promise<void> | void;

export function enhanceAction<T extends Record<string, unknown>>(
	label: string,
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
		const loadingId = globalLoading.start(label);
		let succeeded = false;

		return async ({ result, update }) => {
			try {
				if (result.type === 'success' && result.data !== undefined) {
					await onSuccess({
						data: result.data as T,
						update,
						showError: (message) => globalError.set(message),
					});
					succeeded = true;
				} else if (result.type === 'error') {
					globalError.set(result.error.message);
				} else if (result.type === 'failure') {
					const failure = toFormFailure(result.data);
					if (options.onFailure) {
						options.onFailure(failure);
					} else {
						const shown = toUserMessage(failure);
						globalError.set(shown.message, shown.details);
					}
				}
			} catch (error) {
				globalError.set(error instanceof Error ? error.message : 'Submission failed');
			} finally {
				inFlight = false;
				globalLoading.stop(loadingId, succeeded);
			}
		};
	};
}
