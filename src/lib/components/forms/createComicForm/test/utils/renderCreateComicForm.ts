import CreateComicForm from '$lib/components/forms/createComicForm/CreateComicForm.svelte';
import { CreateComicFormPropsMock } from '$lib/components/forms/createComicForm/test/utils/mockcreateComicForm';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderCreateComicForm(props = CreateComicFormPropsMock[0]) {
	const { getByRole } = render(CreateComicForm);

	return {
		getButton: () => getByRole('button', { name: m.submit() }),
		props,
	};
}
