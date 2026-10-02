import { TextFieldFormPropsSchema } from '$lib/components/forms/textFieldForm/textFieldFormTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getTextFieldFormPropMock() {
	return generateMock(TextFieldFormPropsSchema);
}

export const TextFieldFormPropsMock = generateMocks(TextFieldFormPropsSchema, 10);
