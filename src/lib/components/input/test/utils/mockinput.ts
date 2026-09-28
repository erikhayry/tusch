import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { InputPropsSchema } from '$lib/components/input/inputTypes';

export function getInputPropMock() {
	return generateMock(InputPropsSchema);
}

export const InputPropsMock = generateMocks(InputPropsSchema, 10);
