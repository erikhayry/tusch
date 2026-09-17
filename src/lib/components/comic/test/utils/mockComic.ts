import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { ComicPropsSchema } from '../../comicTypes';

export function getComicPropMock() {
	return generateMock(ComicPropsSchema);
}

export const ComicPropsMock = generateMocks(ComicPropsSchema, 10);
