import { describe, expect, it } from 'vitest';
import { renderPanel } from '$lib/components/panel/test/utils/renderPanel';

describe('Panel', () => {
	it('should render title', () => {
		const { getTitle } = renderPanel();

		expect(getTitle()).toBeInTheDocument();
	});
});
