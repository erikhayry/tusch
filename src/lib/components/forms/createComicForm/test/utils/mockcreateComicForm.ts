import { CreateComicFormPropsSchema } from '$lib/components/forms/createComicForm/createComicFormTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getCreateComicFormPropMock() {
	return generateMock(CreateComicFormPropsSchema);
}

export const CreateComicFormPropsMock = generateMocks(CreateComicFormPropsSchema, 10);
