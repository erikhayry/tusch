import { generateMocks } from '$lib/test/utils/generateMock';
import { ComicSchema } from '$lib/types';

export const ComicsMock = generateMocks(ComicSchema, 10);
