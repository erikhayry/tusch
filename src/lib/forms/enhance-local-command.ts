import { globalError } from '$lib/utils/states/error.svelte';
import type { SubmitFunction } from '@sveltejs/kit';
import type { ZodSafeParseResult } from 'zod';

/**
 * For commands that need no server at all (browser-only settings): validate, run the
 * command synchronously and cancel the request. Unlike `enhanceClientCommand` there is
 * no round trip, so a reload right after submitting can't lose the change.
 */
export function enhanceLocalCommand<T>(
	decode: (formData: FormData) => ZodSafeParseResult<T>,
	command: (value: T) => void,
	{ onStart, onSuccess }: { onStart?: () => void; onSuccess?: () => void } = {},
): SubmitFunction {
	return ({ formData, cancel }) => {
		cancel();
		globalError.reset();
		onStart?.();
		const decoded = decode(formData);
		if (decoded.success) {
			command(decoded.data);
			onSuccess?.();
		} else globalError.set(decoded.error.issues.map((issue) => issue.message).join(' '));
	};
}
