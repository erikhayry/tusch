import { ComicSchema } from '#lib/types/index.ts';
import { PanelPageDataSchema } from '#lib/types/routeData.ts';
import { z } from 'zod';

export const BreadcrumbPropsSchema = z.object({
	comicId: ComicSchema.shape.id,
	comicTitle: ComicSchema.shape.title,
	/** Set on the panel page only: the overview's last item is the comic itself. */
	panelNumber: PanelPageDataSchema.shape.number.optional(),
});

export type BreadcrumbProps = z.infer<typeof BreadcrumbPropsSchema>;

// Route id as SvelteKit names it; the header is shared, so it decides by route.
const COMIC_ROUTE_ID = '/(local)/comic/[id]';

const ComicOverviewDataSchema = z.object({
	comic: ComicSchema.pick({ id: true, title: true }),
});

/**
 * The header's breadcrumb for the comic overview, or `undefined` where there is none. The panel
 * page draws its own breadcrumb in the panel list (`Panels.svelte`), from 48em only, so the
 * header leaves that route alone. The data is parsed so a page that lacks it shows no breadcrumb.
 */
export function breadcrumbProps(
	routeId: string | null,
	data: unknown,
): BreadcrumbProps | undefined {
	if (routeId !== COMIC_ROUTE_ID) {
		return undefined;
	}
	const parsed = ComicOverviewDataSchema.safeParse(data);
	if (!parsed.success) {
		return undefined;
	}
	return { comicId: parsed.data.comic.id, comicTitle: parsed.data.comic.title };
}
