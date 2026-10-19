import { ConfigFormPropsSchema } from '$lib/components/forms/configForm/configFormTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getConfigFormPropMock() {
	return generateMock(ConfigFormPropsSchema);
}

export const ConfigFormPropsMock = generateMocks(ConfigFormPropsSchema, 10);
