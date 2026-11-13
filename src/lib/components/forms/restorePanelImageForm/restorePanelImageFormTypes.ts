import { RestorePanelImageValuesSchema } from '$lib/features/panels/contracts/restorePanelImage';
import { z } from 'zod';

export const RestorePanelImageFormPropsSchema = RestorePanelImageValuesSchema;
export type RestorePanelImageFormProps = z.infer<typeof RestorePanelImageFormPropsSchema>;
