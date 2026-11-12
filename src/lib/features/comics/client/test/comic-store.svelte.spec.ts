import { flushSync } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { createComicCommands } from '../comic-commands';
import { getCharacter, getPanel } from '../comic-selectors';
import { comicStore } from '../comic-store.svelte';
import { CHARACTER_ID, COMIC_ID, IMAGE_ID, PANEL_A, fakeStorage, makeComic } from './fixtures';

function setup() {
	comicStore.replace([makeComic()]);
	const commands = createComicCommands({ store: comicStore, storage: fakeStorage() });

	return { commands };
}

function track<T>(read: () => T) {
	const seen: T[] = [];
	const cleanup = $effect.root(() => {
		$effect(() => {
			seen.push(read());
		});
	});
	flushSync();

	return { seen, cleanup };
}

describe('comic store reactivity', () => {
	let cleanup: (() => void) | undefined;

	afterEach(() => {
		cleanup?.();
		cleanup = undefined;
		comicStore.replace([]);
	});

	it('re-runs effects reading a nested caption after editCaption', () => {
		const { commands } = setup();
		const tracked = track(() => getPanel(comicStore.comics, COMIC_ID, PANEL_A)?.captions[0]);
		cleanup = tracked.cleanup;

		expect(commands.editCaption(COMIC_ID, PANEL_A, 0, 'updated')).toEqual({ ok: true });
		flushSync();

		expect(tracked.seen).toEqual(['caption 0', 'updated']);
	});

	it('re-runs effects reading nested dialogue after deleteDialogue', () => {
		const { commands } = setup();
		const tracked = track(() => getPanel(comicStore.comics, COMIC_ID, PANEL_A)?.dialogue.length);
		cleanup = tracked.cleanup;

		expect(commands.deleteDialogue(COMIC_ID, PANEL_A, 0)).toEqual({ ok: true });
		flushSync();

		expect(tracked.seen).toEqual([1, 0]);
	});

	it('re-runs effects reading character images after removeCharacterImage', () => {
		const { commands } = setup();
		const tracked = track(() =>
			getCharacter(comicStore.comics, COMIC_ID, CHARACTER_ID)?.images.map(({ id }) => id),
		);
		cleanup = tracked.cleanup;

		expect(commands.removeCharacterImage(COMIC_ID, CHARACTER_ID, IMAGE_ID)).toEqual({ ok: true });
		flushSync();

		expect(tracked.seen).toEqual([[IMAGE_ID], []]);
	});

	it('does not re-run effects when a command fails', () => {
		const { commands } = setup();
		const tracked = track(() => getPanel(comicStore.comics, COMIC_ID, PANEL_A)?.captions[0]);
		cleanup = tracked.cleanup;

		expect(commands.editCaption(COMIC_ID, PANEL_A, 99, 'nope').ok).toBe(false);
		flushSync();

		expect(tracked.seen).toEqual(['caption 0']);
	});
});
