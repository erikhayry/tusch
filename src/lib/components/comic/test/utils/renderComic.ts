import Comic from '$lib/components/comic/Comic.svelte';
import { render, within } from '@testing-library/svelte';
import { ComicPropsMock } from './mockComic';

export function renderComic(props = ComicPropsMock[0]) {
	const { getByRole } = render(Comic, props);

	return {
		getTitle: () => getByRole('heading', { name: props.title, level: 2 }),
		getCharacters: () => within(getByRole('list', { name: 'Characters' })).getAllByRole('listitem'),
		getPanels: () => within(getByRole('list', { name: 'Panels' })).getAllByRole('listitem'),
		getSettings: () => within(getByRole('list', { name: 'Setting' })).getAllByRole('listitem'),
    getSource: () => getByRole('link', { name: ComicPropsMock[0].settings.source }),
		props,
	};
}
