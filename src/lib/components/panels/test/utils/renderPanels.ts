import { PanelTestId } from '$lib/components/panel/Panel.svelte';
import Panels from '$lib/components/panels/Panels.svelte';
import { PanelsPropsMock } from '$lib/components/panels/test/utils/mockpanels';
import { m } from '$lib/paraglide/messages';
import { render, within } from '@testing-library/svelte';

export function renderPanels(
	props = { ...PanelsPropsMock[0], current: { ...PanelsPropsMock[0].current, index: 0 } },
) {
	const { getByRole, getByTestId } = render(Panels, props);

	return {
		getPanels: () => within(getByRole('list', { name: m.panels() })).getAllByRole('link'),
		getPanel: () => getByTestId(PanelTestId),
		getComicLink: () => getByRole('link', { name: m.backToComic() }),
		getAddPanelAfterButton: (number: string) =>
			getByRole('button', { name: m.addPanelAfter({ number }) }),
		getAddPanelBeforeButton: (number: string) =>
			getByRole('button', { name: m.addPanelBefore({ number }) }),
		getPanelLink: (index: number) =>
			within(getByRole('list', { name: m.panels() }))
				.getAllByRole('link')
				.at(index),
		props,
	};
}
