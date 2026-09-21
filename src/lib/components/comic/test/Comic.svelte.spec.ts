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

	it('should render charachters', () => {
		const { getCharacters, props } = renderComic();

		expect(getCharacters()).toHaveLength(props.comic.characters.length);
	});

	it('should render panels thumbnails', () => {
		const { getPanelThumbnails, props } = renderComic();

		expect(getPanelThumbnails()).toHaveLength(props.comic.panels.length);
	});

	it('should render setting', () => {
		const { getSettings, props } = renderComic();

		expect(getSettings()).toHaveLength(Object.values(props.comic.setting).length);
	});
});
