import type { ResponsiveImage } from '$lib/types';

export function getImageSrc(image: ResponsiveImage): string {
	return `data:image/webp;base64, ${image.wide.src}`;
}
