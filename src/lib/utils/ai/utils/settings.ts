export const OPEN_AI_ROLE = {
	USER: 'user',
	SYSTEM: 'system',
} as const;

export const MODEL = {
	IMAGE: 'gpt-image-2.5-flare',
	TEXT: 'gpt-6-luna',
} as const;

export const IMAGE_SIZE = {
	WIDE: '1024x1536',
	NARROW: '1536x1024',
};

export const TOOLS = {
	IMAGE: {
		type: 'image_generation',
		model: MODEL.IMAGE,
		size: IMAGE_SIZE.WIDE,
		quality: 'low',
		output_format: 'webp',
		background: 'opaque',
		moderation: 'auto',
	},
} as const;
