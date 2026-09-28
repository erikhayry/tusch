export function buildInitialMessages(url: string): string[] {
	return [
		'Create a comic script from attached url and instructions',
		url,
		'number of panels should be 5 to 10',
	];
}
