import { DeleteItemFormPropsSchema } from '$lib/components/forms/deleteItemForm/deleteItemFormTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getRemoveFieldItemFormPropMock() {
	return generateMock(DeleteItemFormPropsSchema);
}

export const RemoveFieldItemFormPropsMock = generateMocks(DeleteItemFormPropsSchema, 10);
