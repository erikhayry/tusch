import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { CharacterPropsSchema } from '../../characterTypes';

export function getPanelPropMock() {
	return generateMock(CharacterPropsSchema);
}

export const CharachterPropsMock = generateMocks(CharacterPropsSchema, 10);
