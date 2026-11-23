import {
	ImageFormatEnum,
	type Comic,
	type ImageFormat,
	type ImageVariant,
	type PanelImageAsset,
	type ResponsivePanelImage,
} from './index.ts';

/** The variants a format asks for, in generation order: portrait first (REQ-103-2). */
const VARIANTS_BY_FORMAT: Record<ImageFormat, readonly ImageVariant[]> = {
	both: ['portrait', 'landscape'],
	portrait: ['portrait'],
	landscape: ['landscape'],
};

export function variantsFor(format: ImageFormat): readonly ImageVariant[] {
	return VARIANTS_BY_FORMAT[format];
}

/** A comic without a saved format is `both` (REQ-103-1). */
export function imageFormatOf(comic: Pick<Comic, 'imageFormat'>): ImageFormat {
	return comic.imageFormat ?? ImageFormatEnum.enum.both;
}

export interface StoredVariant {
	variant: ImageVariant;
	asset: PanelImageAsset;
}

/** Every variant the panel image has, portrait first. */
export function storedVariants(image: ResponsivePanelImage): StoredVariant[] {
	const variants: StoredVariant[] = [];
	if (image.portrait) {
		variants.push({ variant: 'portrait', asset: image.portrait });
	}
	if (image.landscape) {
		variants.push({ variant: 'landscape', asset: image.landscape });
	}

	return variants;
}

/**
 * The variant that crops, the preview and "include current image" use: the portrait
 * one if the image has it, otherwise the landscape one (REQ-018, REQ-172-1).
 */
export function primaryVariant(image: ResponsivePanelImage | undefined): StoredVariant | undefined {
	if (!image) {
		return undefined;
	}

	return storedVariants(image)[0];
}
