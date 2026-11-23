import { z } from 'zod';

/** A dialogue line as the viewer shows it: the speaker's name is resolved by the page. */
export const SpeechLineSchema = z.object({
	speaker: z.string().optional(),
	text: z.string(),
});

export const PanelBoxesPropsSchema = z.object({
	captions: z.array(z.string()),
	dialogue: z.array(SpeechLineSchema),
	/** Over the picture (top-left captions, bottom speech) rather than stacked below it. */
	overlay: z.boolean(),
});

export type PanelBoxesProps = z.infer<typeof PanelBoxesPropsSchema>;
