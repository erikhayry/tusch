import Error from '$lib/components/error/Error.svelte';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderError() {
	const { getByText, queryByText } = render(Error);

	return {
		getErrorMessage: (message: string) => getByText(message),
		getError: () => getByText(m.error()),
		queryError: () => queryByText(m.error()),
	};
}
