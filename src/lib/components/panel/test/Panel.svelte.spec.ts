import { renderPanel } from '$lib/components/panel/test/utils/renderPanel';
import { describe, expect, it } from 'vitest';

describe('Panel', () => {
	it('should render title', () => {
		const { getTitle } = renderPanel();

		expect(getTitle()).toBeInTheDocument();
	});
});
