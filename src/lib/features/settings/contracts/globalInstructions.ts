import { readString } from '$lib/forms/form-data';
import { z, type ZodSafeParseResult } from 'zod';
import { m } from '$lib/paraglide/messages';

export const GLOBAL_INSTRUCTIONS_MAX_LENGTH = 1000;
export const GLOBAL_INSTRUCTIONS_VALUE_KEY = 'globalInstructions';

/** Missing reads as empty, so prompts stay unchanged when nothing is saved. */
export const GlobalInstructionsSchema = z.string().max(GLOBAL_INSTRUCTIONS_MAX_LENGTH).default('');

export function decodeGlobalInstructions(formData: FormData) {
	return readString(formData, GLOBAL_INSTRUCTIONS_VALUE_KEY);
}

export const SaveGlobalInstructionsValuesSchema = z.object({
	[GLOBAL_INSTRUCTIONS_VALUE_KEY]: z
		.string()
		.max(GLOBAL_INSTRUCTIONS_MAX_LENGTH, { error: () => m.globalInstructionsTooLong() }),
});
export type SaveGlobalInstructionsValues = z.output<typeof SaveGlobalInstructionsValuesSchema>;

export function getSaveGlobalInstructionsValues(
	formData: FormData,
): ZodSafeParseResult<SaveGlobalInstructionsValues> {
	return SaveGlobalInstructionsValuesSchema.safeParse({
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: decodeGlobalInstructions(formData) ?? '',
	});
}
