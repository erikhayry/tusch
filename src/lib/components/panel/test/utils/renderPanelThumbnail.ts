import PanelThumbnail from '$lib/components/panel/PanelThumbnail.svelte';
import { PanelThumbnailPropsMock } from '$lib/components/panel/test/utils/mockPanel';
import { render } from '@testing-library/svelte';

export function renderPanelThumbnail(props = PanelThumbnailPropsMock[0]) {
	const { getByRole } = render(PanelThumbnail, props);

	return {
		getImage: () => getByRole('img', { name: props.panel.image.alt }),
		props
	};
}
