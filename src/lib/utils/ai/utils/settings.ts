export const OPEN_AI_ROLE = {
	USER: 'user',
	SYSTEM: 'system',
} as const;

export const OPEN_AI_TYPE = {
	TEXT: 'input_text',
	IMAGE: 'input_image',
} as const;

export const MODEL = {
	IMAGE: 'gpt-image-2.5-flare',
	TEXT: 'gpt-6-luna',
} as const;

export const IMAGE_SIZE = {
	PORTRAIT: '1024x1536',
	LANDSCAPE: '1536x1024',
} as const;
export type ImageSizeValue = (typeof IMAGE_SIZE)[keyof typeof IMAGE_SIZE];

const IMAGE_SETTINGS = {
	type: 'image_generation',
	model: MODEL.IMAGE,
	quality: 'low',
	output_format: 'webp',
	background: 'opaque',
	moderation: 'auto',
} as const;

export const TOOLS = {
	image: (size: ImageSizeValue) => ({
		...IMAGE_SETTINGS,
		size,
	}),
};
