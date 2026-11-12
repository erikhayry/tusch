import type { Character, CharacterImage, Comic, Panel, ResponsiveImage } from '$lib/types';
import {
	localComicStorage,
	serializeComicSnapshot,
	type ComicSnapshotStorage,
} from './comic-persistence';
import { comicStore, type ComicStoreState } from './comic-store.svelte';

export type CommandFailureCode =
	| 'comic-not-found'
	| 'panel-not-found'
	| 'character-not-found'
	| 'image-not-found'
	| 'invalid-index'
	| 'storage-failed';

export type CommandFailure = { ok: false; code: CommandFailureCode; message: string };
export type CommandResult = { ok: true } | CommandFailure;
type Outcome<T> = { ok: true; value: T } | CommandFailure;

export interface ComicCommandDeps {
	store: ComicStoreState;
	storage: ComicSnapshotStorage;
}

function ok<T>(value: T): Outcome<T> {
	return { ok: true, value };
}

function fail(code: CommandFailureCode, message: string): CommandFailure {
	return { ok: false, code, message };
}

function isIndex<T>(items: readonly T[], index: number): boolean {
	return Number.isInteger(index) && index >= 0 && index < items.length;
}

function updatePanel(
	comic: Comic,
	panelId: string,
	change: (panel: Panel) => Outcome<Panel>,
): Outcome<Comic> {
	const panel = comic.panels.find(({ id }) => id === panelId);
	if (!panel) return fail('panel-not-found', `Panel ${panelId} not found`);

	const next = change(panel);
	if (!next.ok) return next;

	return ok({
		...comic,
		panels: comic.panels.map((current) => (current.id === panelId ? next.value : current)),
	});
}

function updateCharacter(
	comic: Comic,
	characterId: string,
	change: (character: Character) => Outcome<Character>,
): Outcome<Comic> {
	const character = comic.characters.find(({ id }) => id === characterId);
	if (!character) return fail('character-not-found', `Character ${characterId} not found`);

	const next = change(character);
	if (!next.ok) return next;

	return ok({
		...comic,
		characters: comic.characters.map((current) =>
			current.id === characterId ? next.value : current,
		),
	});
}

export function createComicCommands({ store, storage }: ComicCommandDeps) {
	function commit(transition: Outcome<Comic[]>): CommandResult {
		if (!transition.ok) return transition;

		try {
			storage.write(serializeComicSnapshot(transition.value));
		} catch (error) {
			return fail(
				'storage-failed',
				error instanceof Error ? error.message : 'Could not save comics',
			);
		}

		store.replace(transition.value);
		return { ok: true };
	}

	function updateComic(comicId: string, change: (comic: Comic) => Outcome<Comic>): CommandResult {
		const comics = store.comics;
		const comic = comics.find(({ id }) => id === comicId);
		if (!comic) return commit(fail('comic-not-found', `Comic ${comicId} not found`));

		const next = change(comic);
		if (!next.ok) return commit(next);

		return commit(ok(comics.map((current) => (current.id === comicId ? next.value : current))));
	}

	return {
		addComic(comic: Comic): CommandResult {
			const comics = store.comics;
			const exists = comics.some(({ id }) => id === comic.id);

			return commit(
				ok(
					exists
						? comics.map((current) => (current.id === comic.id ? comic : current))
						: [...comics, comic],
				),
			);
		},

		deleteComic(comicId: string): CommandResult {
			const comics = store.comics;
			if (!comics.some(({ id }) => id === comicId)) {
				return commit(fail('comic-not-found', `Comic ${comicId} not found`));
			}

			return commit(ok(comics.filter(({ id }) => id !== comicId)));
		},

		insertPanel(comicId: string, panel: Panel, index: number): CommandResult {
			return updateComic(comicId, (comic) => {
				if (!Number.isInteger(index) || index < 0 || index > comic.panels.length) {
					return fail('invalid-index', `Panel index ${index} is out of range`);
				}

				return ok({
					...comic,
					panels: [...comic.panels.slice(0, index), panel, ...comic.panels.slice(index)],
				});
			});
		},

		deletePanel(comicId: string, panelId: string): CommandResult {
			return updateComic(comicId, (comic) => {
				if (!comic.panels.some(({ id }) => id === panelId)) {
					return fail('panel-not-found', `Panel ${panelId} not found`);
				}

				return ok({ ...comic, panels: comic.panels.filter(({ id }) => id !== panelId) });
			});
		},

		replaceCover(comicId: string, cover: ResponsiveImage): CommandResult {
			return updateComic(comicId, (comic) => ok({ ...comic, cover }));
		},

		removeCover(comicId: string): CommandResult {
			return updateComic(comicId, (comic) => ok({ ...comic, cover: undefined }));
		},

		replacePanelImage(comicId: string, panelId: string, image: Panel['image']): CommandResult {
			return updateComic(comicId, (comic) =>
				updatePanel(comic, panelId, (panel) => ok({ ...panel, image })),
			);
		},

		removePanelImage(comicId: string, panelId: string): CommandResult {
			return updateComic(comicId, (comic) =>
				updatePanel(comic, panelId, (panel) => ok({ ...panel, image: undefined })),
			);
		},

		editCaption(comicId: string, panelId: string, index: number, value: string): CommandResult {
			return updateComic(comicId, (comic) =>
				updatePanel(comic, panelId, (panel) => {
					if (!isIndex(panel.captions, index)) {
						return fail('invalid-index', `Caption index ${index} is out of range`);
					}

					return ok({
						...panel,
						captions: panel.captions.map((caption, i) => (i === index ? value : caption)),
					});
				}),
			);
		},

		deleteCaption(comicId: string, panelId: string, index: number): CommandResult {
			return updateComic(comicId, (comic) =>
				updatePanel(comic, panelId, (panel) => {
					if (!isIndex(panel.captions, index)) {
						return fail('invalid-index', `Caption index ${index} is out of range`);
					}

					return ok({ ...panel, captions: panel.captions.filter((_, i) => i !== index) });
				}),
			);
		},

		editDialogue(comicId: string, panelId: string, index: number, text: string): CommandResult {
			return updateComic(comicId, (comic) =>
				updatePanel(comic, panelId, (panel) => {
					if (!isIndex(panel.dialogue, index)) {
						return fail('invalid-index', `Dialogue index ${index} is out of range`);
					}

					return ok({
						...panel,
						dialogue: panel.dialogue.map((line, i) => (i === index ? { ...line, text } : line)),
					});
				}),
			);
		},

		deleteDialogue(comicId: string, panelId: string, index: number): CommandResult {
			return updateComic(comicId, (comic) =>
				updatePanel(comic, panelId, (panel) => {
					if (!isIndex(panel.dialogue, index)) {
						return fail('invalid-index', `Dialogue index ${index} is out of range`);
					}

					return ok({ ...panel, dialogue: panel.dialogue.filter((_, i) => i !== index) });
				}),
			);
		},

		addCharacterImage(comicId: string, characterId: string, image: CharacterImage): CommandResult {
			return updateComic(comicId, (comic) =>
				updateCharacter(comic, characterId, (character) =>
					ok({ ...character, images: [...character.images, image] }),
				),
			);
		},

		removeCharacterImage(comicId: string, characterId: string, imageId: string): CommandResult {
			return updateComic(comicId, (comic) =>
				updateCharacter(comic, characterId, (character) => {
					if (!character.images.some(({ id }) => id === imageId)) {
						return fail('image-not-found', `Character image ${imageId} not found`);
					}

					return ok({
						...character,
						images: character.images.filter(({ id }) => id !== imageId),
					});
				}),
			);
		},
	};
}

export type ComicCommands = ReturnType<typeof createComicCommands>;

export const comicCommands = createComicCommands({
	store: comicStore,
	storage: localComicStorage,
});

export function expectCommitted(result: CommandResult): void {
	if (!result.ok) throw new Error(result.message);
}
