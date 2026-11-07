import { globalError } from '$lib/utils/states/error.svelte';
import { globalLoading } from '$lib/utils/states/loading.svelte';
import type { SubmitFunction } from '@sveltejs/kit';
import type { ZodSafeParseResult } from 'zod';
import type { UpdateForm } from './enhance-action';
import { toFormFailure } from './form-failure';

export function enhanceClientCommand<T>(
	decode: (formData: FormData) => ZodSafeParseResult<T>,
	command: (value: T) => void,
	onSuccess?: (parameters: { update: UpdateForm }) => Promise<void> | void,
): SubmitFunction {
	let inFlight = false;

	return ({ formData, cancel }) => {
		if (inFlight) {
			cancel();
			return;
		}

		globalError.reset();
		const decoded = decode(formData);
		if (!decoded.success) {
			globalError.set(decoded.error.message);
			cancel();
			return;
		}

		inFlight = true;
		globalLoading.start();

		return async ({ result, update }) => {
			try {
				if (result.type === 'success') {
					command(decoded.data);
					await onSuccess?.({ update });
				} else if (result.type === 'error') {
					globalError.set(result.error.message);
				} else if (result.type === 'failure') {
					globalError.set(toFormFailure(result.data).message);
				}
			} catch (error) {
				globalError.set(error instanceof Error ? error.message : 'Command failed');
			} finally {
				inFlight = false;
				globalLoading.stop();
			}
		};
	};
}
