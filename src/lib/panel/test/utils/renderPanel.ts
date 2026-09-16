import { render } from '@testing-library/svelte';
import Panel from '$lib/panel/Panel.svelte';
import { PanelPropsMock1 } from '$lib/panel/test/utils/mockPanel';

export function renderPanel(props = PanelPropsMock1) {
	const { getByRole } = render(Panel, props);

	return {
		getTitle: () => getByRole('heading', { name: props.title, level: 2 })
	};
}
