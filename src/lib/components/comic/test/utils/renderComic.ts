import { render } from '@testing-library/svelte';
import Comic from '$lib/components/comic/Comic.svelte';
import { ComicPropsMock1 } from '$lib/components/comic/test/utils/mockComic';

export function renderComic(props = ComicPropsMock1) {
	const { getByRole } = render(Comic, props);

	return {
		getTitle: () => getByRole('heading', { name: props.title, level: 2 })
	};
}
