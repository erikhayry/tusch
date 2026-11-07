import { readString } from '$lib/forms/form-data';
import z from 'zod';

export const BYOK_ACTION = 'byok' as const;

export const ByokValuesSchema = z.object({
	key: z.string(),
});
export type ByokValues = z.infer<typeof ByokValuesSchema>;

export function decodeByokValues(formData: FormData) {
	return {
		key: readString(formData, 'key'),
	};
}
