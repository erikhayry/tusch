import { renderPanel } from '$lib/components/panel/test/utils/renderPanel';
import { describe, expect, it } from 'vitest';

describe('Panel', () => {
	it('should render title', () => {
		const { getId } = renderPanel();

		expect(getId()).toBeInTheDocument();
	});
});
