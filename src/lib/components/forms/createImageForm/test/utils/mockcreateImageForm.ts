import { CreateImageFormPropsSchema } from '$lib/components/forms/createImageForm/createImageFormTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getCreateImageFormPropMock() {
	return generateMock(CreateImageFormPropsSchema);
}

export const CreateImageFormPropsMock = generateMocks(CreateImageFormPropsSchema, 10);
