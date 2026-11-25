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

// Route ids as SvelteKit names them; the header is shared, so it decides by route.
const COMIC_ROUTE_ID = '/(local)/comic/[id]';
const PANEL_ROUTE_ID = '/(local)/comic/[id]/[panel]';

const ComicOverviewDataSchema = z.object({
	comic: ComicSchema.pick({ id: true, title: true }),
});

const PanelDataSchema = PanelPageDataSchema.pick({
	comicId: true,
	comicTitle: true,
	number: true,
});

/**
 * The breadcrumb for the route the header sits on, or `undefined` where there is none. Only the
 * two nested comic views have one; the data is parsed so a page that lacks it shows no breadcrumb.
 */
export function breadcrumbProps(
	routeId: string | null,
	data: unknown,
): BreadcrumbProps | undefined {
	if (routeId === COMIC_ROUTE_ID) {
		const parsed = ComicOverviewDataSchema.safeParse(data);
		if (!parsed.success) {
			return undefined;
		}
		return { comicId: parsed.data.comic.id, comicTitle: parsed.data.comic.title };
	}

	if (routeId === PANEL_ROUTE_ID) {
		const parsed = PanelDataSchema.safeParse(data);
		if (!parsed.success) {
			return undefined;
		}
		return {
			comicId: parsed.data.comicId,
			comicTitle: parsed.data.comicTitle,
			panelNumber: parsed.data.number,
		};
	}

	return undefined;
}
