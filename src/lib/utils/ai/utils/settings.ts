import type { Model } from '$lib/types';

export const OPEN_AI_ROLE = {
	USER: 'user',
	SYSTEM: 'system',
} as const;

export const OPEN_AI_TYPE = {
	TEXT: 'input_text',
	IMAGE: 'input_image',
} as const;

export const IMAGE_SIZE = {
	PORTRAIT: '1024x1536',
	LANDSCAPE: '1536x1024',
} as const;
export type ImageSizeValue = (typeof IMAGE_SIZE)[keyof typeof IMAGE_SIZE];

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
