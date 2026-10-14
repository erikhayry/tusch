import { CreateImageFormPropsSchema as CreateCoverImageFormPropsSchema } from '$lib/components/forms/createImageForm/createImageFormTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getCreateCoverImageFormPropMock() {
	return generateMock(CreateCoverImageFormPropsSchema);
}

export const CreateCoverImageFormPropsMock = generateMocks(CreateCoverImageFormPropsSchema, 10);
