import { getComic, getPanel } from '$lib/features/comics/client/comic-selectors';
import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
import { PanelPageDataSchema, PanelRouteParamsSchema } from '$lib/types/routeData';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export type Props = z.infer<typeof PanelPageDataSchema>;

export async function load({ params, parent }) {
	await parent();
	const parsedParams = PanelRouteParamsSchema.safeParse(params);
	if (!parsedParams.success) error(404, 'Panel not found');

	const { id: comicId, panel: panelId } = parsedParams.data;
	const comic = getComic(comicStore.comics, comicId);
	if (!comic) error(404, 'Comic not found');

	// Also covers a panel id that exists, but in a different comic.
	const panel = getPanel(comicStore.comics, comicId, panelId);
	if (!panel) error(404, 'Panel not found');

	const index = comic.panels.indexOf(panel);

	return PanelPageDataSchema.parse({
		panels: comic.panels,
		panel,
		number: index + 1,
		index,
		totalNumberOfPanels: comic.panels.length,
		comicId,
		style: comic.style,
		characters: comic.characters,
	});
}
