import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { ErrorPropsSchema } from '$lib/components/error/errorTypes';

export function getErrorPropMock() {
	return generateMock(ErrorPropsSchema);
}

export const ErrorPropsMock = generateMocks(ErrorPropsSchema, 10);
