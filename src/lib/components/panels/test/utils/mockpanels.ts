import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { PanelsPropsSchema } from '$lib/components/panels/panelsTypes';

export function getPanelsPropMock() {
	return generateMock(PanelsPropsSchema);
}

export const PanelsPropsMock = generateMocks(PanelsPropsSchema, 10);
