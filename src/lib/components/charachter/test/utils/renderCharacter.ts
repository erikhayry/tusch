import { render } from '@testing-library/svelte';
import Character from '../../Character.svelte';
import { CharachterPropsMock } from './mockCharacter';

export function renderCharachter(props = CharachterPropsMock[0]) {
	const { getByRole } = render(Character, props);

	return {
		getName: () => getByRole('heading', { name: props.name, level: 3 })
	};
}
