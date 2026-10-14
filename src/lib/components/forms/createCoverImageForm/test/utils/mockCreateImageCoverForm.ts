import { CreateCoverImageFormPropsSchema } from '$lib/components/forms/createCoverImageForm/createCoverImageFormTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getCreateCoverImageFormPropMock() {
	return generateMock(CreateCoverImageFormPropsSchema);
}

export const CreateCoverImageFormPropsMock = generateMocks(CreateCoverImageFormPropsSchema, 10);
