import Input from '$lib/components/input/Input.svelte';
import { InputPropsMock } from '$lib/components/input/test/utils/mockinput';
import { render } from '@testing-library/svelte';

export function renderInput(props = InputPropsMock[0]) {
	const { getByRole } = render(Input, props);

	return {
		getName: () => getByRole('heading', { name: props.input.name, level: 2 }),
		props,
	};
}
