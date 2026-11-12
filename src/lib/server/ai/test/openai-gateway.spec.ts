// @vitest-environment node
import { SchemaName } from '$lib/utils/ai/aiTypes';
import { IMAGE_SIZE } from '$lib/utils/ai/utils/settings';
import OpenAI from 'openai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CREATE_PANEL_IMAGE_RESPONSE } from '../../../../tests/mock/openAi/openAiResponse';
import { AiGatewayError } from '../ai-gateway';
import { createOpenAiGateway, toAiGatewayError } from '../openai-gateway';

const { mockParse, mockList } = vi.hoisted(() => ({ mockParse: vi.fn(), mockList: vi.fn() }));

vi.mock('openai', async (importOriginal) => {
	const actual = await importOriginal<typeof import('openai')>();
	class MockOpenAI extends actual.default {
		constructor(options: ConstructorParameters<typeof actual.default>[0]) {
			super(options);
			Object.assign(this, { responses: { parse: mockParse }, models: { list: mockList } });
		}
	}
	return { ...actual, default: MockOpenAI, OpenAI: MockOpenAI };
});

function apiError(status: number) {
	return OpenAI.APIError.generate(
		status,
		{ message: `status ${status}` },
		`status ${status}`,
		new Headers(),
	);
}

const credentials = { apiKey: 'sk-test', textModel: 'text-model', imageModel: 'image-model' };
const textRequest = { messages: [], schemaName: SchemaName.enum.createPanel };

describe('OpenAiGateway', () => {
	beforeEach(() => {
		mockParse.mockReset();
		mockList.mockReset();
	});

	it('sends text requests with the configured text model and schema format', async () => {
		mockParse.mockResolvedValue({ output: [] });

		await createOpenAiGateway(credentials).text({ ...textRequest, messages: ['hello'] });

		expect(mockParse.mock.calls[0][0]).toMatchObject({
			model: 'text-model',
			text: { format: expect.objectContaining({ type: 'json_schema' }) },
		});
	});

	it('forwards the reference image and image model on image requests', async () => {
		mockParse.mockResolvedValue(CREATE_PANEL_IMAGE_RESPONSE);
		const imageUrl = 'data:image/png;base64,AAAA';

		const output = await createOpenAiGateway(credentials).image({
			messages: ['draw'],
			schemaName: SchemaName.enum.createImage,
			size: IMAGE_SIZE.PORTRAIT,
			imageUrl,
		});

		expect(output).toEqual(CREATE_PANEL_IMAGE_RESPONSE);
		const request = JSON.stringify(mockParse.mock.calls[0][0]);
		expect(request).toContain(imageUrl);
		expect(request).toContain('image-model');
	});

	it('rejects with missing-key before calling the provider', async () => {
		await expect(createOpenAiGateway({}).text(textRequest)).rejects.toMatchObject({
			kind: 'missing-key',
			status: 401,
		});
		expect(mockParse).not.toHaveBeenCalled();
	});

	it.each([
		[401, 'auth'],
		[403, 'permission'],
		[429, 'rate-limit'],
		[500, 'upstream'],
	])('maps provider HTTP %i to %s', async (status, kind) => {
		mockParse.mockRejectedValue(apiError(status));

		await expect(createOpenAiGateway(credentials).text(textRequest)).rejects.toMatchObject({
			kind,
			status,
		});
	});

	it('maps connection failures', () => {
		const failure = toAiGatewayError(new OpenAI.APIConnectionError({ message: 'socket hang up' }));

		expect(failure).toBeInstanceOf(AiGatewayError);
		expect(failure.kind).toBe('connection');
	});

	describe('ping', () => {
		it('reports a valid key', async () => {
			mockList.mockResolvedValue({ data: [] });

			expect(await createOpenAiGateway(credentials).ping()).toEqual({
				success: true,
				message: 'API key is valid',
			});
		});

		it('reports a rejected key without throwing', async () => {
			mockList.mockRejectedValue(apiError(401));

			expect(await createOpenAiGateway(credentials).ping()).toMatchObject({ success: false });
		});

		it('still throws on rate limiting so it stays retryable', async () => {
			mockList.mockRejectedValue(apiError(429));

			await expect(createOpenAiGateway(credentials).ping()).rejects.toMatchObject({
				kind: 'rate-limit',
			});
		});
	});

	it('lists model ids', async () => {
		mockList.mockResolvedValue({ data: [{ id: 'a' }, { id: 'b' }] });

		expect(await createOpenAiGateway(credentials).models()).toEqual(['a', 'b']);
	});
});
