import PanelThumbnail from '$lib/components/panel/PanelThumbnail.svelte';
import { PanelThumbnailPropsMock } from '$lib/components/panel/test/utils/mockPanel';
import { render } from '@testing-library/svelte';

export function renderPanelThumbnail(props = PanelThumbnailPropsMock[0]) {
	const { findByRole, queryByRole, getByText } = render(PanelThumbnail, props);

	return {
		findPanelImage: () => findByRole('img', { name: props.panel.editorialTitle }),
		queryPanelImage: () => queryByRole('img', { name: props.panel.editorialTitle }),
		getPanelTitle: (title: string) => getByText(title),
		props,
	};
}
