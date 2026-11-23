import { ImageFormatEnum } from '#lib/types/index.ts';
import { z } from 'zod';

export const ImageFormatFormPropsSchema = z.object({
	comicId: z.string(),
	imageFormat: ImageFormatEnum,
});

export type ImageFormatFormProps = z.infer<typeof ImageFormatFormPropsSchema>;
