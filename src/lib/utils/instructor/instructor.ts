import type { Character, Comic, Panel, Setting, Url } from '$lib/types';
import {
	CharactersMock,
	ComicMock,
	PanelsMock,
	SettingMock,
} from '$lib/types/test/utils/mockTypes';
import { randomUUID } from 'crypto';

function getCharacters(): Character[] {
	return CharactersMock;
}

function getSetting(): Setting {
	return SettingMock;
}

function getScriptPanels(): Panel[] {
	return PanelsMock;
}

export async function init(url: Url): Promise<Comic> {
	return {
		id: randomUUID(),
		title: ComicMock.title,
		source: url,
		characters: getCharacters(),
		setting: getSetting(),
		panels: getScriptPanels(),
	};
}
