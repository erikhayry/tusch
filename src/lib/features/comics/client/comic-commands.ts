import type {
	Character,
	CharacterImage,
	Comic,
	Panel,
	ResponsiveImage,
	ResponsivePanelImage,
} from '$lib/types';
import {
	localComicStorage,
	serializeComicSnapshot,
	type ComicSnapshotStorage,
} from './comic-persistence';
import { bootstrapComics } from './bootstrap';
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
	/** Runs before every command so writes never replace comics that were not loaded yet. */
	ensureLoaded?: () => void;
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

export function createComicCommands({ store, storage, ensureLoaded }: ComicCommandDeps) {
	/** Current comics, loading persisted state first so a write never drops unloaded comics. */
	function current(): Comic[] {
		ensureLoaded?.();
		return store.comics;
	}

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
		const comics = current();
		const comic = comics.find(({ id }) => id === comicId);
		if (!comic) return commit(fail('comic-not-found', `Comic ${comicId} not found`));

		const next = change(comic);
		if (!next.ok) return commit(next);

		return commit(ok(comics.map((current) => (current.id === comicId ? next.value : current))));
	}

	const commands = {
		addComic(comic: Comic): CommandResult {
			const comics = current();
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
			const comics = current();
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

		/**
		 * Replaces a panel image and appends the character crops taken from it
		 * as one aggregate commit.
		 */
		commitPanelImage(
			comicId: string,
			panelId: string,
			image: ResponsivePanelImage,
			characterImages: readonly { characterId: string; image: CharacterImage }[],
		): CommandResult {
			return updateComic(comicId, (comic) => {
				const withImage = updatePanel(comic, panelId, (panel) =>
					ok({
						...panel,
						image,
						imageCropIds: characterImages.map(({ image: crop }) => crop.id),
						// Only a replacement keeps something to restore; the older one is dropped.
						previousImage: panel.image
							? { image: panel.image, cropIds: panel.imageCropIds ?? [] }
							: undefined,
					}),
				);

				return characterImages.reduce<Outcome<Comic>>(
					(current, { characterId, image: characterImage }) =>
						current.ok
							? updateCharacter(current.value, characterId, (character) =>
									ok({ ...character, images: [...character.images, characterImage] }),
								)
							: current,
					withImage,
				);
			});
		},

		removePanelImage(comicId: string, panelId: string): CommandResult {
			return updateComic(comicId, (comic) =>
				updatePanel(comic, panelId, (panel) =>
					ok({ ...panel, image: undefined, imageCropIds: undefined, previousImage: undefined }),
				),
			);
		},

		/** Brings back the kept previous image and drops the crops of the image it replaces. */
		restorePanelImage(comicId: string, panelId: string): CommandResult {
			return updateComic(comicId, (comic) => {
				const panel = comic.panels.find(({ id }) => id === panelId);
				if (!panel) return fail('panel-not-found', `Panel ${panelId} not found`);
				const previous = panel.previousImage;
				if (!previous) return fail('image-not-found', `Panel ${panelId} has no previous image`);

				const dropped = new Set(panel.imageCropIds ?? []);
				const restored = updatePanel(comic, panelId, (current) =>
					ok({
						...current,
						image: previous.image,
						imageCropIds: previous.cropIds,
						previousImage: undefined,
					}),
				);
				if (!restored.ok) return restored;

				return ok({
					...restored.value,
					characters: restored.value.characters.map((character) => ({
						...character,
						images: character.images.filter(({ id }) => !dropped.has(id)),
					})),
				});
			});
		},

		addCaption(comicId: string, panelId: string, caption: string): CommandResult {
			return updateComic(comicId, (comic) =>
				updatePanel(comic, panelId, (panel) =>
					ok({ ...panel, captions: [...panel.captions, caption] }),
				),
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

	return commands;
}

export type ComicCommands = ReturnType<typeof createComicCommands>;

export const comicCommands = createComicCommands({
	store: comicStore,
	storage: localComicStorage,
	ensureLoaded: bootstrapComics,
});

export function expectCommitted(result: CommandResult): void {
	if (!result.ok) throw new Error(result.message);
}
