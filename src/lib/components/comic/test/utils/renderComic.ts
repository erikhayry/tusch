import Comic from '$lib/components/comic/Comic.svelte';
import { TestId as SettingTestId } from '$lib/components/setting/Setting.svelte';
import { render, within } from '@testing-library/svelte';
import { ComicPropsMock } from './mockComic';
import { m } from '$lib/paraglide/messages';

export function renderComic(props = ComicPropsMock[0]) {
	const { getByRole, getByTestId } = render(Comic, props);

	const {
		comic: { source, title }
	} = props;

	return {
		getTitle: () => getByRole('heading', { name: title, level: 2 }),
		getCharacters: () => within(getByRole('list', { name: m.characters() })).getAllByRole('listitem'),
		getPanelThumbnails: () =>
			within(getByRole('list', { name: m.panels() })).getAllByRole('listitem'),
		getSetting: () => getByTestId(SettingTestId),
		getSource: () => getByRole('link', { name: source }),
		props
	};
}
