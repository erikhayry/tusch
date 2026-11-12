import { bootstrapComics } from '$lib/features/comics/client/bootstrap';
import { getComic } from '$lib/features/comics/client/comic-selectors';
import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
import { PanelPageDataSchema, PanelRouteParamsSchema } from '$lib/types/routeData';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export type Props = z.infer<typeof PanelPageDataSchema>;

export function load({ params }) {
	const parsedParams = PanelRouteParamsSchema.safeParse(params);
	if (!parsedParams.success) error(404, 'Panel not found');

	const { id: comicId, panel: panelId } = parsedParams.data;
	bootstrapComics();
	const comic = getComic(comicStore.comics, comicId);
	if (!comic) error(404, 'Comic not found');

	const index = comic.panels.findIndex(({ id }) => id === panelId);
	if (index === -1) error(404, 'Panel not found');

	return PanelPageDataSchema.parse({
		panels: comic.panels,
		panel: comic.panels[index],
		number: index + 1,
		index,
		totalNumberOfPanels: comic.panels.length,
		comicId,
		style: comic.style,
		characters: comic.characters,
	});
}
