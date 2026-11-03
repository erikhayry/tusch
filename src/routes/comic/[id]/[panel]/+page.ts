import { PanelPageDataSchema, PanelRouteParamsSchema } from '$lib/types/routeData';
import { getComic } from '$lib/utils/db/db.svelte';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export type Props = z.infer<typeof PanelPageDataSchema>;

export function load({ params }) {
	const parsedParams = PanelRouteParamsSchema.safeParse(params);
	if (!parsedParams.success) error(404, 'Panel not found');

	const { id: comicId, panel: panelId } = parsedParams.data;
	const comic = getComic(comicId);
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
