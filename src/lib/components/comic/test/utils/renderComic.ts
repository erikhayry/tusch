import Comic from '$lib/components/comic/Comic.svelte';
import { render } from '@testing-library/svelte';
import { ComicPropsMock } from './mockComic';

export function renderComic(props = ComicPropsMock[0]) {
	const { getByRole } = render(Comic, props);

	return {
		getTitle: () => getByRole('heading', { name: props.title, level: 2 })
	};
}
