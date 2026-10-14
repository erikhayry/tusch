import { generateMock } from '$lib/test/utils/generateMock';
import { PanelsMock } from '$lib/types/test/utils/mockTypes';
import {
	CreatePanelImageResponseSchema,
	type CreatePanelImageResponse,
} from '../createPanelImageApiTypes';

export const mockImageResponse: CreatePanelImageResponse = {
	...generateMock(CreatePanelImageResponseSchema),
	panelId: PanelsMock[0].id,
};
