import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { TextFieldFormPropsSchema } from '$lib/components/textFieldForm/textFieldFormTypes';

export function getTextFieldFormPropMock() {
	return generateMock(TextFieldFormPropsSchema);
}

export const TextFieldFormPropsMock = generateMocks(TextFieldFormPropsSchema, 10);
