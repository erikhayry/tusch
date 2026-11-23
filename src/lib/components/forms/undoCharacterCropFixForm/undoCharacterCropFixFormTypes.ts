import { UndoCharacterCropFixValuesSchema } from '#lib/features/panels/contracts/undoCharacterCropFix.ts';
import { z } from 'zod';

export const UndoCharacterCropFixFormPropsSchema = z.object({
	label: z.string(),
	values: UndoCharacterCropFixValuesSchema,
	onSuccess: z.function({ input: [], output: z.void() }).optional(),
});

export type UndoCharacterCropFixFormProps = z.infer<typeof UndoCharacterCropFixFormPropsSchema>;
