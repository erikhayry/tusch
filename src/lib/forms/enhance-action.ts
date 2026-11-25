import type { SubmitFunction } from '$app/forms';
import { globalError } from '#lib/utils/states/error.svelte.ts';
import { globalLoading } from '#lib/utils/states/loading.svelte.ts';
import {
	toFieldMessages,
	toFormFailure,
	toUserMessage,
	type FieldMessages,
	type FormFailure,
} from './form-failure';

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

/**
 * A form's own progress UI, used instead of the global loader (REQ-301-1). `start` gets
 * the function that aborts the request; `end` runs once, however the request finishes.
 */
export type SubmissionProgress = {
	start: (abort: () => void) => void;
	end: () => void;
};

export function enhanceAction<T extends Record<string, unknown>>(
	label: string,
	onSuccess: ActionSuccessHandler<T>,
	options: {
		onFailure?: (failure: FormFailure) => void;
		/**
		 * Receives the rejected fields' messages, to show next to each field (REQ-201-1).
		 * Cleared at each submission, so a fixed field stops being marked (REQ-201-3).
		 */
		onFieldErrors?: (messages: FieldMessages) => void;
		progress?: SubmissionProgress;
	} = {},
): SubmitFunction<T> {
	let inFlight = false;

	return ({ cancel, controller }) => {
		if (inFlight) {
			cancel();
			return;
		}

		inFlight = true;
		globalError.reset();
		options.onFieldErrors?.({});
		const loadingId = options.progress ? undefined : globalLoading.start(label);
		options.progress?.start(() => controller.abort());
		let succeeded = false;
		let finished = false;
		let aborted = false;
		let resultReceived = false;

		// An aborted request never reaches the result callback below, so it finishes here.
		// It shows no error: the user cancelled, or left the page.
		const finish = () => {
			if (finished) {
				return;
			}
			finished = true;
			inFlight = false;
			if (loadingId !== undefined) {
				globalLoading.stop(loadingId, succeeded);
			}
			options.progress?.end();
		};
		// Once the result has arrived the response is complete: an abort then (say, the form is
		// removed while `update()` runs) must not finish early, or focus would be restored before
		// SvelteKit's own focus reset after a success. The result path finishes the submission.
		controller.signal.addEventListener(
			'abort',
			() => {
				if (resultReceived) {
					return;
				}
				aborted = true;
				finish();
			},
			{ once: true },
		);

		return async ({ result, update }) => {
			resultReceived = true;
			if (aborted) {
				return;
			}
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
					options.onFieldErrors?.(toFieldMessages(failure));
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
				finish();
			}
		};
	};
}
