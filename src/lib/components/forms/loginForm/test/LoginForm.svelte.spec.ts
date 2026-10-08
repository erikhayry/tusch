import { renderLoginForm } from '$lib/components/forms/loginForm/test/utils/renderLoginForm';
import { describe, expect, it } from 'vitest';

describe('LoginForm', () => {
	it('should render key input', () => {
		const { getKeyInputField } = renderLoginForm();

		expect(getKeyInputField()).toBeInTheDocument();
	});
});
