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

	it('should show current panel link', () => {
		const { getPanelLink, props } = renderPanels();

		expect(getPanelLink(props.current.index)).toHaveAttribute('aria-current', 'page');
	});

	it('should show add panel after button', () => {
		const { getAddPanelAfterButton } = renderPanels();

		expect(getAddPanelAfterButton('2')).toBeInTheDocument();
	});

	it('should show add panel before button', () => {
		const { getAddPanelBeforeButton } = renderPanels();

		expect(getAddPanelBeforeButton('1')).toBeInTheDocument();
	});
});
