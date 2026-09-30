import Panel from '$lib/components/panel/Panel.svelte';
import { PanelPropsMock } from '$lib/components/panel/test/utils/mockPanel';
import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';

export function renderPanel(props = PanelPropsMock[0]) {
	const { getByRole } = render(Panel, props);

	return {
		getTitle: () =>
			getByRole('heading', {
				name: `${m.panelTitle({ number: props.number, total: props.totalNumberOfPanels })}`,
				level: 2,
			}),
	};
}
