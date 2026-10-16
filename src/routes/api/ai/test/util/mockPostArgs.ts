import type { SchemaName } from '$lib/utils/ai/aiTypes';

export const COOKIES_MOCK = {
	cookies: {
		get: () => 'apiKey',
	},
};

export function mockPostArgs(messagesJsonString: string, schemaName: SchemaName) {
	return {
		request: {
			json: async () => ({
				messagesJsonString,
				schemaName,
			}),
		},
		...COOKIES_MOCK,
	};
}
