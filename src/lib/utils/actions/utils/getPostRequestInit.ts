export function getPostRequestInit(body?: Record<string, unknown>) {
	if (body) {
		return {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
			},
		};
	}

	return undefined;
}
