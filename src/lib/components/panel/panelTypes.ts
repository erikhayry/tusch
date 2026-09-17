import { z } from 'zod';

export const PanelPropsSchema = z.object({
	title: z.string()
});

export type PanelProps = z.infer<typeof PanelPropsSchema>;
