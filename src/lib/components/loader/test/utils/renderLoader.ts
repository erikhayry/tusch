import Loader from '$lib/components/loader/Loader.svelte';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderLoader() {
	const { getByText, queryByText } = render(Loader);

	return {
		getLoader: () => getByText(m.loading()),
		queryLoader: () => queryByText(m.loading()),
	};
}
