import { m } from '#lib/paraglide/messages.js';
import { ImageVariantEnum, type ImageVariant } from '#lib/types/index.ts';

const FAILED_MESSAGES: Record<ImageVariant, () => string> = {
	[ImageVariantEnum.enum.portrait]: () => m.portraitImageFailed(),
	[ImageVariantEnum.enum.landscape]: () => m.landscapeImageFailed(),
};

/** Says which variant couldn't be made while the other one was saved (REQ-103-3, REQ-011). */
export function variantFailedMessage(variant: ImageVariant): string {
	return FAILED_MESSAGES[variant]();
}
