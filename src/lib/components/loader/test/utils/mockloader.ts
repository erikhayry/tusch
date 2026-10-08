import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { LoaderPropsSchema } from '$lib/components/loader/loaderTypes';

export function getLoaderPropMock() {
	return generateMock(LoaderPropsSchema);
}

export const LoaderPropsMock = generateMocks(LoaderPropsSchema, 10);
