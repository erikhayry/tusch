import { describe, expect, it } from 'vitest';
import { renderComic } from '$lib/comic/test/utils/renderComic.svelte.spec';

describe('Comic', () => {
	it('should render title', () => {
		const { getTitle } = renderComic();

		expect(getTitle()).toBeInTheDocument();
	});
});
