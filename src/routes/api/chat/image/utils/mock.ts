import { generateMock } from '$lib/test/utils/generateMock';
import { CreateImageResponseSchema } from '../createImageApiTypes';

export const mockImageResponse = {
	...generateMock(CreateImageResponseSchema),
	src: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
	alt: 'mock alt text',
};
