import { RestorePanelImageValuesSchema } from '$lib/features/panels/contracts/restorePanelImage';
import { z } from 'zod';

export const RestorePanelImageFormPropsSchema = RestorePanelImageValuesSchema.extend({
	onSuccess: z.function({ input: [], output: z.void() }).optional(),
});
export type RestorePanelImageFormProps = z.infer<typeof RestorePanelImageFormPropsSchema>;
