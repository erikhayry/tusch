import Character from '$lib/components/charachter/Character.svelte';
import { CharachterPropsMock } from '$lib/components/charachter/test/utils/mockCharacter';
import { render } from '@testing-library/svelte';

export function renderCharachter(props = CharachterPropsMock[0]) {
	const { getByRole } = render(Character, props);

	return {
		getName: () => getByRole('heading', { name: props.character.name, level: 2 }),
		props,
	};
}
