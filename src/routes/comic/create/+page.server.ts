import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	return {
		url: cookies.get('url'),
	};
};

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const url = data.get('url');

		cookies.set('url', url?.toString() ?? '', { path: '/' });

		return { success: true };
	},
} satisfies Actions;
