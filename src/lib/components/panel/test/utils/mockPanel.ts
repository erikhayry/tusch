import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { PanelPropsSchema } from '../../panelTypes';

export function getPanelPropMock() {
	return generateMock(PanelPropsSchema);
}

export const PanelPropsMock = generateMocks(PanelPropsSchema, 10);
export const PanelThumbnailPropsMock = generateMocks(PanelPropsSchema, 10);
