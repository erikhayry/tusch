import { z } from 'zod';

export const GeneratingImageDialogPropsSchema = z.object({
	open: z.boolean(),
	/** When the request started, in ms since the epoch; the timer counts from it. */
	startedAt: z.number(),
	panelNumber: z.number().int().positive(),
	/** Omitted from the subtitle when the panel has no title. */
	panelTitle: z.string().optional(),
	/** The variants being made, already translated, e.g. "portrait and landscape". */
	variants: z.string(),
	onCancel: z.function({ input: [], output: z.void() }),
});

export type GeneratingImageDialogProps = z.infer<typeof GeneratingImageDialogPropsSchema>;
