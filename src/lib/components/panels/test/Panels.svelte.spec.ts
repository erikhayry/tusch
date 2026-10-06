import { renderPanels } from '$lib/components/panels/test/utils/renderPanels';
import { describe, expect, it } from 'vitest';

describe('Panels', () => {
	it('should render panels side bar', () => {
		const { getPanels, props } = renderPanels();

		expect(getPanels()).toHaveLength(props.panels.length);
	});

	it('should render panel', () => {
		const { getPanel } = renderPanels();

		expect(getPanel()).toBeInTheDocument();
	});

	it('should show comic link', () => {
		const { getComicLink, props } = renderPanels();

		expect(getComicLink()).toHaveAttribute('href', `/comic/${props.comicId}`);
	});
});
