import { renderPanelThumbnail } from '$lib/components/panel/test/utils/renderPanelThumbnail';
import { describe, expect, it } from 'vitest';

describe('Panel Thumbnail', () => {
	it('should render image', () => {
		const { getPanelImage } = renderPanelThumbnail();

		expect(getPanelImage()).toBeInTheDocument();
	});
});
