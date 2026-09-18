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

		expect(getCharacters()).toHaveLength(props.comic.script.characters.length);
	});

	it('should render panels', () => {
		const { getPanels, props } = renderComic();

		expect(getPanels()).toHaveLength(props.comic.script.panels.length);
	});

	it('should render setting', () => {
		const { getSettings, props } = renderComic();

		expect(getSettings()).toHaveLength(Object.values(props.comic.script.setting).length);
	});
});
