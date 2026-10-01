import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { RemoveFieldItemFormPropsSchema } from '$lib/components/removeFieldItemForm/removeFieldItemFormTypes';

export function getRemoveFieldItemFormPropMock() {
	return generateMock(RemoveFieldItemFormPropsSchema);
}

export const RemoveFieldItemFormPropsMock = generateMocks(RemoveFieldItemFormPropsSchema, 10);
