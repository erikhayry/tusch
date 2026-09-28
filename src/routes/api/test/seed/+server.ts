// src/routes/api/test/seed/+server.ts
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { addComic, clearComics } from '$lib/utils/db/db';
import { json } from '@sveltejs/kit';

export async function POST() {
	clearComics();
	ComicsMock.forEach((comic) => addComic(comic));

	return json({ success: true });
}
