import type { ImageAsset } from '$lib/types';

export function getImageSrc(image?: ImageAsset): string {
	if (!image) return '';

	return image.src;
}
