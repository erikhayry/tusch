import { readString } from '$lib/forms/form-data';
import {
	GLOBAL_INSTRUCTIONS_VALUE_KEY,
	GlobalInstructionsSchema,
	decodeGlobalInstructions,
} from '$lib/features/settings/contracts/globalInstructions';
import { ComicSchema, ComicStyleEnum } from '$lib/types';
import { m } from '$lib/paraglide/messages';
import z from 'zod';

export const CREATE_COMIC_ACTION = 'create-comic' as const;

const STORY_MIN_LENGTH = 20;
const STORY_MAX_LENGTH = 10_000;

export const CreateComicValuesSchema = z
	.object({
		url: z.optional(z.url()),
		story: z.optional(z.string().min(STORY_MIN_LENGTH).max(STORY_MAX_LENGTH)),
		style: ComicStyleEnum,
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: GlobalInstructionsSchema,
	})
	.refine((values) => values.url !== undefined || values.story !== undefined, {
		message: m.createComicSourceHint(),
		path: ['url'],
	});
export type CreateComicValues = z.output<typeof CreateComicValuesSchema>;

export const CreateComicResultSchema = z.object({
	comic: ComicSchema,
	output: z.string(),
});
export type CreateComicResult = z.infer<typeof CreateComicResultSchema>;

// An empty field means "not given", not "invalid".
function blankToUndefined(value: string | undefined) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

export function decodeCreateComicValues(formData: FormData) {
	return {
		url: blankToUndefined(readString(formData, 'url')),
		story: blankToUndefined(readString(formData, 'story')),
		style: readString(formData, 'style'),
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: decodeGlobalInstructions(formData),
	};
}
