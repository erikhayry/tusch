import { renderPanelThumbnail } from '$lib/components/panel/test/utils/renderPanelThumbnail';
import { describe, expect, it } from 'vitest';
import { PanelThumbnailPropsMock } from './utils/mockPanel';

describe('Panel Thumbnail', () => {
	it('should render image if exists', async () => {
		const { findPanelImage } = renderPanelThumbnail();

		expect(await findPanelImage()).toBeInTheDocument();
	});

	it('should render panel title if image does not exist', () => {
		const { queryPanelImage, getPanelTitle } = renderPanelThumbnail({
			...PanelThumbnailPropsMock[0],
			panel: { ...PanelThumbnailPropsMock[0].panel, image: undefined },
		});

		expect(queryPanelImage()).not.toBeInTheDocument();
		expect(getPanelTitle(PanelThumbnailPropsMock[0].panel.editorialTitle)).toBeInTheDocument();
	});
});
