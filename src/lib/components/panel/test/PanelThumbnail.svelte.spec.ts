import { renderPanelThumbnail } from '$lib/components/panel/test/utils/renderPanelThumbnail';
import { describe, expect, it } from 'vitest';
import { PanelThumbnailPropsMock } from './utils/mockPanel';

describe('Panel Thumbnail', () => {
	it('should render image if exists', () => {
		const { getPanelImage } = renderPanelThumbnail();

		expect(getPanelImage()).toBeInTheDocument();
	});

	it('should render panel id if image does not exist', () => {
		const { queryPanelImage, getPanelId } = renderPanelThumbnail({
			...PanelThumbnailPropsMock[0],
			panel: { ...PanelThumbnailPropsMock[0].panel, image: undefined },
		});

		expect(queryPanelImage()).not.toBeInTheDocument();
		expect(getPanelId(PanelThumbnailPropsMock[0].panel.id)).toBeInTheDocument();
	});
});
