import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { EditTextFieldFormPropsSchema } from '../../editTextFieldFormTypes';

export function getEditTextFieldFormPropMock() {
	return generateMock(EditTextFieldFormPropsSchema);
}

export const EditTextFieldFormPropsMock = generateMocks(EditTextFieldFormPropsSchema, 10);
