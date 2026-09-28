import { CharacterPropsSchema } from '$lib/components/charachter/characterTypes';
import { generateMock, generateMocks } from '$lib/test/utils/generateMock';

export function getPanelPropMock() {
	return generateMock(CharacterPropsSchema);
}

export const CharachterPropsMock = generateMocks(CharacterPropsSchema, 10);
