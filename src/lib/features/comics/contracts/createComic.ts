import { readInteger, readString } from '#lib/forms/form-data.ts';
import {
	GLOBAL_INSTRUCTIONS_VALUE_KEY,
	GlobalInstructionsSchema,
	decodeGlobalInstructions,
} from '#lib/features/settings/contracts/globalInstructions.ts';
import { ComicSchema, ComicStyleEnum, ImageVariantEnum } from '#lib/types/index.ts';
import { m } from '#lib/paraglide/messages.js';
import z from 'zod';

export const CREATE_COMIC_ACTION = 'create-comic' as const;

const STORY_MIN_LENGTH = 20;
const STORY_MAX_LENGTH = 10_000;

export const PANEL_COUNT_MIN = 1;
export const PANEL_COUNT_MAX = 30;
export const PANEL_COUNT_DEFAULT = 5;

const panelCountError = () => m.createComicPanelCountError();

export const CreateComicValuesSchema = z
	.object({
		url: z.optional(z.url()),
		story: z.optional(z.string().min(STORY_MIN_LENGTH).max(STORY_MAX_LENGTH)),
		style: ComicStyleEnum,
		panelCount: z
			.int({ error: panelCountError })
			.min(PANEL_COUNT_MIN, { error: panelCountError })
			.max(PANEL_COUNT_MAX, { error: panelCountError }),
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: GlobalInstructionsSchema,
	})
	.refine((values) => values.url !== undefined || values.story !== undefined, {
		message: m.createComicSourceHint(),
		path: ['url'],
	});
export type CreateComicValues = z.output<typeof CreateComicValuesSchema>;

export const CreateComicResultSchema = z.object({
	comic: ComicSchema,
	/** Set when one cover variant couldn't be made and the other was saved (REQ-011). */
	failedVariant: ImageVariantEnum.optional(),
	output: z.string(),
});
export type CreateComicResult = z.infer<typeof CreateComicResultSchema>;

// An empty field means "not given", not "invalid".
function blankToUndefined(value: string | undefined) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

/** The copy for a rejected panel count, or `undefined` when the count is fine. */
export function explainCreateComicError(error: z.ZodError): string | undefined {
	const rejected = error.issues.some((issue) => issue.path[0] === 'panelCount');
	return rejected ? panelCountError() : undefined;
}

export function decodeCreateComicValues(formData: FormData) {
	return {
		url: blankToUndefined(readString(formData, 'url')),
		story: blankToUndefined(readString(formData, 'story')),
		style: readString(formData, 'style'),
		panelCount: readInteger(formData, 'panelCount'),
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: decodeGlobalInstructions(formData),
	};
}
