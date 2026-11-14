import { readString } from '$lib/forms/form-data';
import {
	GLOBAL_INSTRUCTIONS_VALUE_KEY,
	GlobalInstructionsSchema,
	decodeGlobalInstructions,
} from '$lib/features/settings/contracts/globalInstructions';
import { ComicSchema, ComicStyleEnum } from '$lib/types';
import z from 'zod';

export const CREATE_COMIC_ACTION = 'create-comic' as const;

export const CreateComicValuesSchema = z.object({
	url: z.url(),
	style: ComicStyleEnum,
	[GLOBAL_INSTRUCTIONS_VALUE_KEY]: GlobalInstructionsSchema,
});
export type CreateComicValues = z.output<typeof CreateComicValuesSchema>;

export const CreateComicResultSchema = z.object({
	comic: ComicSchema,
	output: z.string(),
});
export type CreateComicResult = z.infer<typeof CreateComicResultSchema>;

export function decodeCreateComicValues(formData: FormData) {
	return {
		url: readString(formData, 'url'),
		style: readString(formData, 'style'),
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: decodeGlobalInstructions(formData),
	};
}
