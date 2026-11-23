import type { ImageAsset } from '#lib/types/index.ts';

export function getImageSrc(image?: ImageAsset): string {
	if (!image) {
		return '';
	}

	return image.src;
}
