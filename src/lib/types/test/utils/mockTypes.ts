import { generateMocks } from '$lib/test/utils/generateMock';
import { ComicSchema, type Comic, type ResponsiveImage } from '$lib/types';

export const ComicsMock = generateMocks(ComicSchema, 3);

export function getComicsMock() {
	return generateMocks(ComicSchema, 3);
}

export const ComicMock = ComicsMock.at(0) as Comic;

export const CharactersMock = ComicMock.characters;

export const SettingMock = ComicMock.setting;

export const PanelsMock = ComicMock.panels;

export const UrlMock = ComicMock.source;

export const ImageMock: ResponsiveImage = {
	wide: {
		src: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
		width: 1000,
		height: 1000,
	},
	narrow: {
		src: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
		width: 1000,
		height: 1000,
	},
	alt: 'MockedImage',
};
