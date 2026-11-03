import type { Model } from '$lib/types';
import { z } from 'zod';

export const OPEN_AI_ROLE = {
	USER: 'user',
	SYSTEM: 'system',
} as const;

export const OPEN_AI_TYPE = {
	TEXT: 'input_text',
	IMAGE: 'input_image',
} as const;

export const ImageSizeSchema = z.enum(['1024x1536', '1536x1024']);
export type ImageSizeValue = z.infer<typeof ImageSizeSchema>;

export const IMAGE_SIZE = {
	PORTRAIT: ImageSizeSchema.enum['1024x1536'],
	LANDSCAPE: ImageSizeSchema.enum['1536x1024'],
} as const;

export function getImageSettings(model: Model) {
	return {
		type: 'image_generation',
		model,
		quality: 'low',
		output_format: 'webp',
		background: 'opaque',
		moderation: 'auto',
	} as const;
}

export const TOOLS = {
	image: (size: ImageSizeValue, model: Model) => ({
		...getImageSettings(model),
		size,
	}),
};
