import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { CreatePanelFormPropsSchema } from '../../createPanelFormTypes';

export function getCreatePanelFormPropMock() {
	return generateMock(CreatePanelFormPropsSchema);
}

export const CreatePanelFormPropsMock = generateMocks(CreatePanelFormPropsSchema, 10);
