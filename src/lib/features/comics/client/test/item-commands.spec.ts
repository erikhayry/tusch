import { DB_ITEM_TYPE } from '$lib/utils/db/dbTypes';
import { describe, expect, it } from 'vitest';
import { createComicCommands } from '../comic-commands';
import { applyItemDelete, applyItemEdit } from '../item-commands';
import {
	CHARACTER_ID,
	COMIC_ID,
	OTHER_COMIC_ID,
	PANEL_A,
	fakeStorage,
	fakeStore,
	makeComic,
} from './fixtures';

function setup() {
	const store = fakeStore([makeComic(), makeComic(OTHER_COMIC_ID)]);
	const commands = createComicCommands({ store, storage: fakeStorage() });

	return { store, commands };
}

describe('item commands', () => {
	it('deletes a caption at the given index', () => {
		const { store, commands } = setup();

		applyItemDelete(
			{ type: DB_ITEM_TYPE.enum.captions, comicId: COMIC_ID, panelId: PANEL_A, index: 0 },
			commands,
		);

		expect(store.comics[0].panels[0].captions).toEqual(['caption 1']);
	});

	it('deletes a panel', () => {
		const { store, commands } = setup();

		applyItemDelete(
			{ type: DB_ITEM_TYPE.enum.panels, comicId: COMIC_ID, panelId: PANEL_A },
			commands,
		);

		expect(store.comics[0].panels).toHaveLength(1);
	});

	it('deletes a comic', () => {
		const { store, commands } = setup();

		applyItemDelete({ type: DB_ITEM_TYPE.enum.comics, comicId: COMIC_ID }, commands);

		expect(store.comics.map(({ id }) => id)).toEqual([OTHER_COMIC_ID]);
	});

	it('removes a cover and a panel image', () => {
		const { store, commands } = setup();

		applyItemDelete({ type: DB_ITEM_TYPE.enum.coverImage, comicId: COMIC_ID }, commands);
		applyItemDelete(
			{ type: DB_ITEM_TYPE.enum.panelImage, comicId: COMIC_ID, panelId: PANEL_A },
			commands,
		);

		expect(store.comics[0].cover).toBeUndefined();
		expect(store.comics[0].panels[0].image).toBeUndefined();
	});

	it('edits dialogue text', () => {
		const { store, commands } = setup();

		applyItemEdit(
			{
				type: DB_ITEM_TYPE.enum.dialogue,
				comicId: COMIC_ID,
				panelId: PANEL_A,
				index: 0,
				value: 'edited',
			},
			commands,
		);

		expect(store.comics[0].panels[0].dialogue[0]).toEqual({
			characterId: CHARACTER_ID,
			text: 'edited',
		});
	});

	it('throws when the target is missing so the form surfaces the error', () => {
		const { commands } = setup();

		expect(() =>
			applyItemDelete(
				{ type: DB_ITEM_TYPE.enum.panels, comicId: COMIC_ID, panelId: 'missing' },
				commands,
			),
		).toThrow('Panel missing not found');
	});
});
