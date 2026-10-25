import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { CreateCharacterImageFormPropsSchema } from '../../createCharacterImageFormTypes';

export function getCreateCharacterImageFormPropMock() {
	return generateMock(CreateCharacterImageFormPropsSchema);
}

export const CreateCharacterImageFormPropsMock = generateMocks(
	CreateCharacterImageFormPropsSchema,
	10,
);
