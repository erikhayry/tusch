import type { Comic } from '../../../types';

const DB: Map<string, Comic> = new Map();

export function getComic(id: string) {
	return DB.get(id);
}
