import { readInteger, readJsonField, readString } from '#lib/forms/form-data.ts';
import { CharacterBoxesSchema } from '#lib/utils/ai/aiTypes.ts';
import z from 'zod';
import { CharacterPromptSchema } from '../../comics/contracts/prompts';

export const FIX_CHARACTER_CROP_ACTION = 'fix-character-crop' as const;

/** The panel's current image is read from OPFS by the form and sent as a data URL. */
export const FixCharacterCropValuesSchema = z.object({
	comicId: z.string().min(1),
	panelId: z.string().min(1),
	characterId: z.string().min(1),
	characterImageId: z.string().min(1),
	character: CharacterPromptSchema,
	image: z.string().startsWith('data:image/'),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	/** Boxes the panel image gives for the character; a hint that may be wrong. */
	current: CharacterBoxesSchema.optional(),
});
export type FixCharacterCropValues = z.output<typeof FixCharacterCropValuesSchema>;

export const FixCharacterCropResultSchema = CharacterBoxesSchema.extend({
	comicId: z.string(),
	panelId: z.string(),
	characterId: z.string(),
	characterImageId: z.string(),
});
export type FixCharacterCropResult = z.infer<typeof FixCharacterCropResultSchema>;

export function decodeFixCharacterCropValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		panelId: readString(formData, 'panelId'),
		characterId: readString(formData, 'characterId'),
		characterImageId: readString(formData, 'characterImageId'),
		character: readJsonField(formData, 'character'),
		image: readString(formData, 'image'),
		width: readInteger(formData, 'width'),
		height: readInteger(formData, 'height'),
		current: readJsonField(formData, 'current'),
	};
}
