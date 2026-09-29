export const ROLE = {
	USER: 'user',
	ASSISTANT: 'assistant',
};

export const INIT = {
	WHAT: 'Create a comic script from attached url and instructions',
	HOW: 'number of panels should be 5 to 10',
};

export function buildInitialMessages(url: string): string[] {
	return [INIT.WHAT, url, INIT.HOW];
}
