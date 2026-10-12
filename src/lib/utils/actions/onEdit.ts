import type { SubmitFunction } from '@sveltejs/kit';
import { globalError } from '../states/error.svelte';
import { globalLoading } from '../states/loading.svelte';

type ValidationResult<T> =
	{ success: true; data: T } | { success: false; error: { message: string } };

export type SubmitCallback = NonNullable<Awaited<ReturnType<SubmitFunction>>>;

export function onEdit<T>(
	getValues: (formData: FormData) => Promise<ValidationResult<T>> | ValidationResult<T>,
	updateType: (data: T) => void,
	onSuccess?: SubmitCallback,
): SubmitFunction {
	return async ({ formData }) => {
		globalLoading.start();
		globalError.reset();

		const result = await getValues(formData);

		if (result.success) {
			updateType(result.data);
		} else {
			globalError.set(result.error.message);
		}

		return async (parameters) => {
			try {
				if (result.success && onSuccess) {
					await onSuccess(parameters);
				} else {
					await parameters.update();
				}
			} finally {
				globalLoading.stop();
			}
		};
	};
}
