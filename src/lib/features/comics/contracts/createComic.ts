import { readInteger, readString } from '#lib/forms/form-data.ts';
import {
	GLOBAL_INSTRUCTIONS_VALUE_KEY,
	GlobalInstructionsSchema,
	decodeGlobalInstructions,
} from '#lib/features/settings/contracts/globalInstructions.ts';
import {
	ComicSchema,
	ComicStyleEnum,
	CUSTOM_STYLE_MAX_LENGTH,
	CUSTOM_STYLE_MIN_LENGTH,
	ImageVariantEnum,
} from '#lib/types/index.ts';
import { m } from '#lib/paraglide/messages.js';
import z from 'zod';

export const CREATE_COMIC_ACTION = 'create-comic' as const;

const STORY_MIN_LENGTH = 20;
export const STORY_MAX_LENGTH = 10_000;

export const PANEL_COUNT_MIN = 1;
export const PANEL_COUNT_MAX = 30;
export const PANEL_COUNT_DEFAULT = 5;

const panelCountError = () => m.createComicPanelCountError();

/** A custom style's description, trimmed before the length check (REQ-97-2). */
export const CustomStyleSchema = z
	.string()
	.min(CUSTOM_STYLE_MIN_LENGTH, { error: () => m.customStyleTooShort() })
	.max(CUSTOM_STYLE_MAX_LENGTH, { error: () => m.customStyleTooLong() });

export const CreateComicValuesSchema = z
	.object({
		url: z.optional(z.url()),
		story: z.optional(z.string().min(STORY_MIN_LENGTH).max(STORY_MAX_LENGTH)),
		style: ComicStyleEnum,
		customStyle: z.optional(z.string()),
		panelCount: z
			.int({ error: panelCountError })
			.min(PANEL_COUNT_MIN, { error: panelCountError })
			.max(PANEL_COUNT_MAX, { error: panelCountError }),
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: GlobalInstructionsSchema,
	})
	.refine((values) => values.url !== undefined || values.story !== undefined, {
		message: m.createComicSourceHint(),
		path: ['url'],
	})
	.superRefine((values, ctx) => {
		if (values.style !== ComicStyleEnum.enum.custom) {
			return;
		}

		const described = CustomStyleSchema.safeParse(values.customStyle ?? '');
		if (!described.success) {
			ctx.addIssue({
				code: 'custom',
				path: ['customStyle'],
				message: described.error.issues[0]?.message ?? '',
			});
		}
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
	if (rejected) {
		return panelCountError();
	}

	return error.issues.find((issue) => issue.path[0] === 'customStyle')?.message;
}

/** The copy for a custom style the browser can check before posting, or `undefined` when it's fine. */
export function explainCustomStyleError(formData: FormData): string | undefined {
	if (readString(formData, 'style') !== ComicStyleEnum.enum.custom) {
		return undefined;
	}

	const described = CustomStyleSchema.safeParse(readCustomStyle(formData));
	return described.success ? undefined : described.error.issues[0]?.message;
}

// Trimmed before the length check, so spaces alone don't count as a description (REQ-97-2).
function readCustomStyle(formData: FormData): string {
	return (readString(formData, 'customStyle') ?? '').trim();
}

export function decodeCreateComicValues(formData: FormData) {
	return {
		url: blankToUndefined(readString(formData, 'url')),
		story: blankToUndefined(readString(formData, 'story')),
		style: readString(formData, 'style'),
		customStyle: blankToUndefined(readString(formData, 'customStyle')),
		panelCount: readInteger(formData, 'panelCount'),
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: decodeGlobalInstructions(formData),
	};
}
