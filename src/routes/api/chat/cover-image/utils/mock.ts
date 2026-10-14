import { generateMock } from '$lib/test/utils/generateMock';
import {
	CreateCoverImageResponseSchema,
	type CreateCoverImageResponse,
} from '../createCoverImageApiTypes';

export const mockImageResponse: CreateCoverImageResponse = {
	...generateMock(CreateCoverImageResponseSchema),
};
