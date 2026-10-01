import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { FieldActionsPropsSchema } from '$lib/components/panel/components/fieldActions/fieldActionsTypes

export function getFieldActionsPropMock() {
	return generateMock(FieldActionsPropsSchema);
}

export const FieldActionsPropsMock = generateMocks(FieldActionsPropsSchema, 10);
