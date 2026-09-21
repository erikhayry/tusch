import Panel from '$lib/components/panel/Panel.svelte';
import { PanelPropsMock } from '$lib/components/panel/test/utils/mockPanel';
import { render } from '@testing-library/svelte';

export function renderPanel(props = PanelPropsMock[0]) {
	const { getByRole } = render(Panel, props);

	return {
		getId: () => getByRole('heading', { name: props.panel.id, level: 2 })
	};
}
