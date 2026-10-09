import type { ResponsiveImage } from '$lib/types';

export function getImageSrc(image?: ResponsiveImage): string {
	if (!image) return '';

	return image.wide.src;
}
