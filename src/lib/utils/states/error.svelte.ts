import { z } from 'zod';

export const ErrorStateSchema = z.discriminatedUnion('isError', [
	z.object({ isError: z.literal(true), message: z.string(), details: z.string().optional() }),
	z.object({ isError: z.literal(false) }),
]);
export type ErrorStateValue = z.infer<typeof ErrorStateSchema>;

class ErrorState {
	private isErrorState = $state<ErrorStateValue>({ isError: false });

	get error() {
		return this.isErrorState;
	}

	/** `details` is the technical message, shown only on request. */
	set(message: string, details?: string) {
		this.isErrorState = ErrorStateSchema.parse({ isError: true, message, details });
	}

	reset() {
		this.isErrorState = ErrorStateSchema.parse({ isError: false });
	}
}

export const globalError = new ErrorState();
