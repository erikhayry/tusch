import { describe, expect, it } from 'vitest';
import { renderComic } from '$lib/components/comic/test/utils/renderComic';

describe('Comic', () => {
	it('should render title', () => {
		const { getTitle } = renderComic();

		expect(getTitle()).toBeInTheDocument();
	});
});
