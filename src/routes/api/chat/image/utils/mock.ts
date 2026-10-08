import { generateMock } from '$lib/test/utils/generateMock';
import { PanelsMock } from '$lib/types/test/utils/mockTypes';
import { CreateImageResponseSchema, type CreateImageResponse } from '../createImageApiTypes';

export const mockImageResponse: CreateImageResponse = {
	...generateMock(CreateImageResponseSchema),
	panelId: PanelsMock[0].id,
};
