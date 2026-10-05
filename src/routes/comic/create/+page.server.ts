import { addComic } from '$lib/utils/db/db';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request, fetch }) => {
		const data = await request.formData();
		const url = data.get('url');

		const comicResponse = await fetch('/api/chat/init', {
			method: 'POST',
			body: JSON.stringify({ url: url?.toString() }),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const comicJSON = await comicResponse.json();

		addComic(comicJSON);

		redirect(303, `/comic/${comicJSON.id}`);
	},
} satisfies Actions;
