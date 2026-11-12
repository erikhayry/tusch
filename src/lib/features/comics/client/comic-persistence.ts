import { browser } from '$app/environment';
import { ComicSchema, type Comic } from '$lib/types';
import { ComicEntriesSchema, STORAGE } from '$lib/utils/db/dbTypes';
import z from 'zod';

export const COMIC_SNAPSHOT_VERSION = 1;
const INVALID_SNAPSHOT_KEY = `${STORAGE.COMICS}_invalid`;

export const ComicSnapshotSchema = z.object({
	version: z.literal(COMIC_SNAPSHOT_VERSION),
	comics: z.array(ComicSchema),
});
export type ComicSnapshot = z.infer<typeof ComicSnapshotSchema>;

export type ComicSnapshotRead =
	| { status: 'missing' }
	| { status: 'loaded'; comics: Comic[] }
	| { status: 'invalid'; reason: string; raw: string };

export interface ComicSnapshotStorage {
	read(): string | null;
	write(serialized: string): void;
	preserveInvalid(raw: string): void;
}

export function readComicSnapshot(raw: string | null): ComicSnapshotRead {
	if (raw === null) return { status: 'missing' };

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return { status: 'invalid', reason: 'corrupt JSON', raw };
	}

	// Legacy format before versioning: an array of [id, comic] tuples.
	if (Array.isArray(parsed)) {
		const legacy = ComicEntriesSchema.safeParse(parsed);
		if (!legacy.success) return { status: 'invalid', reason: 'invalid legacy comics', raw };

		return { status: 'loaded', comics: legacy.data.map(([, comic]) => comic) };
	}

	const version =
		typeof parsed === 'object' && parsed !== null && 'version' in parsed
			? parsed.version
			: undefined;
	if (version !== COMIC_SNAPSHOT_VERSION) {
		return { status: 'invalid', reason: `unsupported version ${String(version)}`, raw };
	}

	const snapshot = ComicSnapshotSchema.safeParse(parsed);
	if (!snapshot.success) return { status: 'invalid', reason: 'invalid comics', raw };

	return { status: 'loaded', comics: snapshot.data.comics };
}

export function serializeComicSnapshot(comics: Comic[]): string {
	const snapshot: ComicSnapshot = ComicSnapshotSchema.parse({
		version: COMIC_SNAPSHOT_VERSION,
		comics,
	});

	return JSON.stringify(snapshot);
}

// Storage is browser-only. On the server the store lives in memory and nothing is written.
export const localComicStorage: ComicSnapshotStorage = {
	read: () => (browser ? localStorage.getItem(STORAGE.COMICS) : null),
	write: (serialized) => {
		if (browser) localStorage.setItem(STORAGE.COMICS, serialized);
	},
	preserveInvalid: (raw) => {
		if (browser) localStorage.setItem(INVALID_SNAPSHOT_KEY, raw);
	},
};
