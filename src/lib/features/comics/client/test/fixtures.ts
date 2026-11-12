import { generateMock } from '$lib/test/utils/generateMock';
import {
	CharacterImageSchema,
	CharacterSchema,
	ComicSchema,
	PanelSchema,
	type Character,
	type Comic,
	type Panel,
} from '$lib/types';
import type { ComicSnapshotStorage } from '../comic-persistence';
import type { ComicStoreState } from '../comic-store.svelte';

export const COMIC_ID = '11111111-1111-4111-8111-111111111111';
export const OTHER_COMIC_ID = '22222222-2222-4222-8222-222222222222';
export const PANEL_A = '33333333-3333-4333-8333-333333333333';
export const PANEL_B = '44444444-4444-4444-8444-444444444444';
export const CHARACTER_ID = '55555555-5555-4555-8555-555555555555';
export const IMAGE_ID = '66666666-6666-4666-8666-666666666666';
export const MISSING_ID = '77777777-7777-4777-8777-777777777777';

export function makePanel(id: string, overrides: Partial<Panel> = {}): Panel {
	return {
		...generateMock(PanelSchema),
		id,
		captions: ['caption 0', 'caption 1'],
		dialogue: [{ characterId: CHARACTER_ID, text: 'line 0' }],
		image: undefined,
		...overrides,
	};
}

export function makeCharacter(): Character {
	return {
		...generateMock(CharacterSchema),
		id: CHARACTER_ID,
		images: [{ ...generateMock(CharacterImageSchema), id: IMAGE_ID, panelId: PANEL_A }],
	};
}

export function makeComic(id = COMIC_ID): Comic {
	return {
		...generateMock(ComicSchema),
		id,
		cover: undefined,
		panels: [makePanel(PANEL_A), makePanel(PANEL_B)],
		characters: [makeCharacter()],
	};
}

export function fakeStore(initial: Comic[]) {
	const store = {
		comics: initial,
		replaceCalls: 0,
		replace(next: Comic[]) {
			store.comics = next;
			store.replaceCalls += 1;
		},
	};

	return store as typeof store & ComicStoreState;
}

export function fakeStorage(options: { failWrite?: boolean; raw?: string | null } = {}) {
	const storage = {
		writes: [] as string[],
		preserved: [] as string[],
		read: (): string | null => options.raw ?? null,
		write(serialized: string) {
			if (options.failWrite) throw new Error('QuotaExceededError');
			storage.writes.push(serialized);
		},
		preserveInvalid(raw: string) {
			storage.preserved.push(raw);
		},
	};

	return storage as typeof storage & ComicSnapshotStorage;
}
