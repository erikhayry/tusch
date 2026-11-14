import { UndoCharacterCropFixValuesSchema } from '$lib/features/panels/contracts/undoCharacterCropFix';
import { z } from 'zod';

export const UndoCharacterCropFixFormPropsSchema = z.object({
	label: z.string(),
	values: UndoCharacterCropFixValuesSchema,
});

export type UndoCharacterCropFixFormProps = z.infer<typeof UndoCharacterCropFixFormPropsSchema>;
