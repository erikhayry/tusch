import { readString } from '$lib/forms/form-data';
import { ComicSchema, ComicStyleEnum } from '$lib/types';
import z from 'zod';

export const CREATE_COMIC_ACTION = 'create-comic' as const;

export const CreateComicValuesSchema = z.object({
	url: z.url(),
	style: ComicStyleEnum,
});
export type CreateComicValues = z.infer<typeof CreateComicValuesSchema>;

export const CreateComicResultSchema = z.object({
	comic: ComicSchema,
	output: z.string(),
});
export type CreateComicResult = z.infer<typeof CreateComicResultSchema>;

export function decodeCreateComicValues(formData: FormData) {
	return {
		url: readString(formData, 'url'),
		style: readString(formData, 'style'),
	};
}
