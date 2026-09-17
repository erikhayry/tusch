import { type Comic, ComicSchema, ImageAssetSchema } from '$lib/types';
import { generateMock } from '@anatine/zod-mock';

export function getImageMock() {
	return generateMock(ImageAssetSchema);
}

export const ComicMock1: Comic = Object.values(ComicSchema);
