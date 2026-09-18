import { generateMocks } from '$lib/test/utils/generateMock';
import { ComicSchema, type Comic } from '$lib/types';

export const ComicsMock = generateMocks(ComicSchema, 10);

export const ComicMock = ComicsMock.at(0) as Comic;

export const CharactersMock = ComicMock.characters;

export const SettingMock = ComicMock.setting;

export const PanelsMock = ComicMock.panels;

export const UrlMock = ComicMock.source;
