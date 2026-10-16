import { vi } from 'vitest';

// 1. Export the spies directly so your tests can import and assert on them
export const mockCreate = vi.fn();
export const mockParse = vi.fn();
export const mockList = vi.fn();

// 2. Export a factory function that returns the mocked module
export function mockOpenAiFactory() {
	class MockOpenAI {
		chat = {
			completions: {
				create: mockCreate,
			},
		};
		models = {
			list: mockList,
		};
		responses = {
			parse: mockParse,
		};
	}

	return {
		default: MockOpenAI,
		OpenAI: MockOpenAI,
	};
}
