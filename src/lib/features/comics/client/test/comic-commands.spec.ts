import { generateMock } from '$lib/test/utils/generateMock';
import { CharacterImageSchema, ResponsivePanelImageSchema, type Comic } from '$lib/types';
import { describe, expect, it } from 'vitest';
import { createComicCommands, expectCommitted } from '../comic-commands';
import {
	CHARACTER_ID,
	COMIC_ID,
	IMAGE_ID,
	MISSING_ID,
	OTHER_COMIC_ID,
	PANEL_A,
	PANEL_B,
	fakeStorage,
	fakeStore,
	makeComic,
	makePanel,
} from './fixtures';

function setup(comics: Comic[] = [makeComic(), makeComic(OTHER_COMIC_ID)], failWrite = false) {
	const store = fakeStore(comics);
	const storage = fakeStorage({ failWrite });
	const commands = createComicCommands({ store, storage });

	return { store, storage, commands };
}

function panelOf(comics: Comic[], panelId = PANEL_A) {
	return comics[0].panels.find(({ id }) => id === panelId)!;
}

describe('comic commands', () => {
	describe('commit behaviour', () => {
		it('replaces the store once and persists once per successful command', () => {
			const { store, storage, commands } = setup();

			expect(commands.editCaption(COMIC_ID, PANEL_A, 0, 'new')).toEqual({ ok: true });

			expect(store.replaceCalls).toBe(1);
			expect(storage.writes).toHaveLength(1);
		});

		it('does not change the store or storage when a command fails', () => {
			const { store, storage, commands } = setup();
			const before = store.comics;

			expect(commands.deleteComic(MISSING_ID).ok).toBe(false);

			expect(store.comics).toBe(before);
			expect(store.replaceCalls).toBe(0);
			expect(storage.writes).toHaveLength(0);
		});

		it('keeps the store unchanged when the storage write fails', () => {
			const { store, commands } = setup(undefined, true);
			const before = store.comics;

			const result = commands.editCaption(COMIC_ID, PANEL_A, 0, 'new');

			expect(result).toMatchObject({ ok: false, code: 'storage-failed' });
			expect(store.comics).toBe(before);
			expect(store.replaceCalls).toBe(0);
		});

		it('does not mutate the previous state (copy-on-write)', () => {
			const comics = [makeComic(), makeComic(OTHER_COMIC_ID)];
			const { commands } = setup(comics);

			commands.editCaption(COMIC_ID, PANEL_A, 0, 'changed');

			expect(panelOf(comics).captions[0]).toBe('caption 0');
		});
	});

	describe('comics', () => {
		it('adds a new comic', () => {
			const { store, commands } = setup([]);
			const comic = makeComic('88888888-8888-4888-8888-888888888888');

			expect(commands.addComic(comic)).toEqual({ ok: true });
			expect(store.comics).toEqual([comic]);
		});

		it('replaces an existing comic in place', () => {
			const { store, commands } = setup();
			const updated = { ...makeComic(COMIC_ID), title: 'Renamed' };

			commands.addComic(updated);

			expect(store.comics).toHaveLength(2);
			expect(store.comics[0].title).toBe('Renamed');
		});

		it('deletes a comic', () => {
			const { store, commands } = setup();

			commands.deleteComic(COMIC_ID);

			expect(store.comics.map(({ id }) => id)).toEqual([OTHER_COMIC_ID]);
		});

		it('reports a missing comic on delete', () => {
			const { commands } = setup();

			expect(commands.deleteComic(MISSING_ID)).toMatchObject({
				ok: false,
				code: 'comic-not-found',
			});
		});

		it('replaces and removes the cover', () => {
			const { store, commands } = setup();
			const cover = generateMock(ResponsivePanelImageSchema);

			commands.replaceCover(COMIC_ID, cover);
			expect(store.comics[0].cover).toEqual(cover);

			commands.removeCover(COMIC_ID);
			expect(store.comics[0].cover).toBeUndefined();
		});
	});

	describe('panels', () => {
		it('inserts a panel at the given index', () => {
			const { store, commands } = setup();
			const panel = makePanel('99999999-9999-4999-8999-999999999999');

			expect(commands.insertPanel(COMIC_ID, panel, 1)).toEqual({ ok: true });

			expect(store.comics[0].panels.map(({ id }) => id)).toEqual([PANEL_A, panel.id, PANEL_B]);
		});

		it('inserts a panel at the end', () => {
			const { store, commands } = setup();
			const panel = makePanel('99999999-9999-4999-8999-999999999999');

			commands.insertPanel(COMIC_ID, panel, 2);

			expect(store.comics[0].panels.at(-1)?.id).toBe(panel.id);
		});

		it.each([-1, 3, 1.5])('rejects the insertion index %s', (index) => {
			const { store, commands } = setup();

			expect(commands.insertPanel(COMIC_ID, makePanel(MISSING_ID), index)).toMatchObject({
				ok: false,
				code: 'invalid-index',
			});
			expect(store.replaceCalls).toBe(0);
		});

		it('deletes a panel', () => {
			const { store, commands } = setup();

			commands.deletePanel(COMIC_ID, PANEL_A);

			expect(store.comics[0].panels.map(({ id }) => id)).toEqual([PANEL_B]);
		});

		it('reports a missing panel on delete', () => {
			const { commands } = setup();

			expect(commands.deletePanel(COMIC_ID, MISSING_ID)).toMatchObject({
				ok: false,
				code: 'panel-not-found',
			});
		});

		it('reports a missing comic when the comic does not exist', () => {
			const { commands } = setup();

			expect(commands.insertPanel(MISSING_ID, makePanel(PANEL_A), 0)).toMatchObject({
				ok: false,
				code: 'comic-not-found',
			});
		});
	});

	describe('panel images', () => {
		it('replaces and removes a panel image', () => {
			const { store, commands } = setup();
			const image = generateMock(ResponsivePanelImageSchema);

			commands.replacePanelImage(COMIC_ID, PANEL_A, image);
			expect(panelOf(store.comics).image).toEqual(image);

			commands.removePanelImage(COMIC_ID, PANEL_A);
			expect(panelOf(store.comics).image).toBeUndefined();
		});

		it('reports a missing panel when replacing an image', () => {
			const { commands } = setup();

			expect(
				commands.replacePanelImage(COMIC_ID, MISSING_ID, generateMock(ResponsivePanelImageSchema)),
			).toMatchObject({ ok: false, code: 'panel-not-found' });
		});
	});

	describe('captions and dialogue', () => {
		it('edits a caption', () => {
			const { store, commands } = setup();

			commands.editCaption(COMIC_ID, PANEL_A, 1, 'new caption');

			expect(panelOf(store.comics).captions).toEqual(['caption 0', 'new caption']);
		});

		it('deletes a caption', () => {
			const { store, commands } = setup();

			commands.deleteCaption(COMIC_ID, PANEL_A, 0);

			expect(panelOf(store.comics).captions).toEqual(['caption 1']);
		});

		it('edits dialogue text without changing the speaker', () => {
			const { store, commands } = setup();

			commands.editDialogue(COMIC_ID, PANEL_A, 0, 'new line');

			expect(panelOf(store.comics).dialogue[0]).toEqual({
				characterId: CHARACTER_ID,
				text: 'new line',
			});
		});

		it('deletes dialogue', () => {
			const { store, commands } = setup();

			commands.deleteDialogue(COMIC_ID, PANEL_A, 0);

			expect(panelOf(store.comics).dialogue).toEqual([]);
		});

		it.each([
			[
				'caption',
				(commands: ReturnType<typeof setup>['commands']) =>
					commands.editCaption(COMIC_ID, PANEL_A, 5, 'x'),
			],
			[
				'caption delete',
				(commands: ReturnType<typeof setup>['commands']) =>
					commands.deleteCaption(COMIC_ID, PANEL_A, -1),
			],
			[
				'dialogue',
				(commands: ReturnType<typeof setup>['commands']) =>
					commands.editDialogue(COMIC_ID, PANEL_A, 9, 'x'),
			],
			[
				'dialogue delete',
				(commands: ReturnType<typeof setup>['commands']) =>
					commands.deleteDialogue(COMIC_ID, PANEL_A, 9),
			],
		])('rejects an out-of-range %s index', (_name, run) => {
			const { commands } = setup();

			expect(run(commands)).toMatchObject({ ok: false, code: 'invalid-index' });
		});
	});

	describe('character images', () => {
		it('adds a character image', () => {
			const { store, commands } = setup();
			const image = {
				...generateMock(CharacterImageSchema),
				id: '88888888-8888-4888-8888-888888888888',
				panelId: PANEL_B,
			};

			commands.addCharacterImage(COMIC_ID, CHARACTER_ID, image);

			expect(store.comics[0].characters[0].images.at(-1)).toEqual(image);
		});

		it('removes a character image by id', () => {
			const { store, commands } = setup();

			commands.removeCharacterImage(COMIC_ID, CHARACTER_ID, IMAGE_ID);

			expect(store.comics[0].characters[0].images).toEqual([]);
		});

		it('does not remove another image when the image id is unknown', () => {
			const { store, commands } = setup();

			expect(commands.removeCharacterImage(COMIC_ID, CHARACTER_ID, MISSING_ID)).toMatchObject({
				ok: false,
				code: 'image-not-found',
			});
			expect(store.comics[0].characters[0].images).toHaveLength(1);
		});

		it('reports a missing character', () => {
			const { commands } = setup();

			expect(
				commands.addCharacterImage(COMIC_ID, MISSING_ID, generateMock(CharacterImageSchema)),
			).toMatchObject({ ok: false, code: 'character-not-found' });
		});
	});

	describe('expectCommitted', () => {
		it('does nothing for a committed result', () => {
			expect(() => expectCommitted({ ok: true })).not.toThrow();
		});

		it('throws the failure message for a failed result', () => {
			expect(() =>
				expectCommitted({ ok: false, code: 'comic-not-found', message: 'Comic x not found' }),
			).toThrow('Comic x not found');
		});
	});
});
