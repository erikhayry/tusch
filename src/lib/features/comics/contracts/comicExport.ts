import { ComicSchema } from '#lib/types/index.ts';
import { z } from 'zod';

/** Identifies the export file; an importer rejects anything else (REQ-90-2). */
export const COMIC_EXPORT_FORMAT = 'tusch-comic';
export const COMIC_EXPORT_VERSION = 1;

/**
 * The "Export comic data" file. `comic` is the stored comic with every image `src`
 * replaced by a `data:` URL, so the file carries everything needed to recreate it.
 */
export const ComicExportSchema = z.object({
	format: z.literal(COMIC_EXPORT_FORMAT),
	version: z.literal(COMIC_EXPORT_VERSION),
	comic: ComicSchema,
});
export type ComicExport = z.infer<typeof ComicExportSchema>;
