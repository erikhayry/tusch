import { render } from '@testing-library/svelte';
import Character from '../../Character.svelte';
import { CharachterPropsMock } from './mockCharacter';

export function renderCharachter(props = CharachterPropsMock[0]) {
	const { getByRole, getByText, getAllByRole } = render(Character, props);

	return {
		getName: () => getByRole('heading', { name: props.character.name, level: 3 }),
		getDescription: () => getByText(props.character.description),
		getImages: () => getAllByRole('img'),
		props
	};
}
