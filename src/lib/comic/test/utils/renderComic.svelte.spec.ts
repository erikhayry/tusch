import { render } from '@testing-library/svelte';
import Comic from '$lib/comic/Comic.svelte';
import { ComicPropsMock1 } from '$lib/comic/test/utils/mockComic';

export function renderComic(props = ComicPropsMock1) {
	const { getByRole } = render(Comic, props);

	return {
		getTitle: () => getByRole('heading', { name: props.title, level: 2 })
	};
}
