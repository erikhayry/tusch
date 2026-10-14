import { CreatePanelImageFormPropsSchema } from '$lib/components/forms/createPanelImageForm/createPanelImageFormTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getCreateImageFormPropMock() {
	return generateMock(CreatePanelImageFormPropsSchema);
}

export const CreatePanelImageFormPropsMock = generateMocks(CreatePanelImageFormPropsSchema, 10);
