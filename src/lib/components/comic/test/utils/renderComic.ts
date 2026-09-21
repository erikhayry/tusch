import Comic from '$lib/components/comic/Comic.svelte';
import { render, within } from '@testing-library/svelte';
import { ComicPropsMock } from './mockComic';

export function renderComic(props = ComicPropsMock[0]) {
	const { getByRole } = render(Comic, props);

	const {
		comic: { source, title }
	} = props;

	return {
		getTitle: () => getByRole('heading', { name: title, level: 2 }),
		getCharacters: () => within(getByRole('list', { name: 'Characters' })).getAllByRole('listitem'),
		getPanelThumbnails: () =>
			within(getByRole('list', { name: 'Panels' })).getAllByRole('listitem'),
		getSettings: () => within(getByRole('list', { name: 'Setting' })).getAllByRole('listitem'),
		getSource: () => getByRole('link', { name: source }),
		props
	};
}
