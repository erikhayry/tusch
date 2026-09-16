import { describe, expect, it } from 'vitest';
import { renderPanel } from '$lib/panel/test/utils/renderPanel';

describe('Panel', () => {
	it('should render title', () => {
		const { getTitle } = renderPanel();

		expect(getTitle()).toBeInTheDocument();
	});
});
