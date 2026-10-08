import LoginForm from '$lib/components/forms/loginForm/LoginForm.svelte';
import { LoginFormPropsMock } from '$lib/components/forms/loginForm/test/utils/mockloginForm';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderLoginForm(props = LoginFormPropsMock[0]) {
	const { getByRole } = render(LoginForm, props);

	return {
		getKeyInputField: () => getByRole('textbox', { name: m.byok() }),
		props,
	};
}
