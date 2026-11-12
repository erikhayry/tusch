import { AddCaptionValuesSchema } from '$lib/features/panels/contracts/addCaption';
import { z } from 'zod';

export const AddCaptionFormPropsSchema = AddCaptionValuesSchema.pick({
	comicId: true,
	panelId: true,
});
export type AddCaptionFormProps = z.infer<typeof AddCaptionFormPropsSchema>;
