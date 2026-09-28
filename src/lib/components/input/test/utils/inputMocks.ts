import { InputPropsSchema } from '$lib/components/input/inputTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getInputPropMock() {
	return generateMock(InputPropsSchema);
}

export const InputPropsMock = generateMocks(InputPropsSchema, 10);
