import type { ResponsiveImage } from '$lib/types';

export function getImageSrc(image: ResponsiveImage): string {
	return image.wide.src;
}
