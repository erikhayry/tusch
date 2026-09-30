import PanelThumbnail from '$lib/components/panel/PanelThumbnail.svelte';
import { PanelThumbnailPropsMock } from '$lib/components/panel/test/utils/mockPanel';
import { render } from '@testing-library/svelte';

export function renderPanelThumbnail(props = PanelThumbnailPropsMock[0]) {
	const { getByRole, queryByRole, getByText } = render(PanelThumbnail, props);

	return {
		getPanelImage: () => getByRole('img', { name: props.alt }),
		queryPanelImage: () => queryByRole('img', { name: props.alt }),
		getPanelId: (id: string) => getByText(id),
		props,
	};
}
