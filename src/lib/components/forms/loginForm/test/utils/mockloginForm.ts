import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { LoginFormPropsSchema } from '../../loginFormTypes';

export function getLoginFormPropMock() {
	return generateMock(LoginFormPropsSchema);
}

export const LoginFormPropsMock = generateMocks(LoginFormPropsSchema, 10);
