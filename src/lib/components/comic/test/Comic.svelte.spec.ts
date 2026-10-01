import { renderComic } from '$lib/components/comic/test/utils/renderComic';
import { describe, expect, it } from 'vitest';

describe('Comic', () => {
	it('should render title', () => {
		const { getTitle } = renderComic();

		expect(getTitle()).toBeInTheDocument();
	});

	it('should render source', () => {
		const { getSource } = renderComic();

		expect(getSource()).toBeInTheDocument();
	});

	it('should render panels thumbnails', () => {
		const { getPanel, props } = renderComic();

		expect(getPanel()).toHaveLength(props.comic.panels.length);
	});

	it('should show delete panel button', () => {
		const { getDeletePanelButton } = renderComic();

		expect(getDeletePanelButton(1)).toBeInTheDocument();
	});

	it('should render charachters', () => {
		const { getCharacters, props } = renderComic();

		expect(getCharacters()).toHaveLength(props.comic.characters!.length);
	});

	it('should render setting', () => {
		const { getSetting } = renderComic();

		expect(getSetting()).toBeInTheDocument();
	});
});
