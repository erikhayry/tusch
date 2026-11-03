import { FieldActionsPropsSchema } from '$lib/components/panel/components/fieldActions/fieldActionsTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getFieldActionsPropMock() {
	return generateMock(FieldActionsPropsSchema);
}

export const FieldActionsPropsMock = generateMocks(FieldActionsPropsSchema, 10);
