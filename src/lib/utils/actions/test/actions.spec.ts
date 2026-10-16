import { generateMock } from '$lib/test/utils/generateMock';
import { CharacterSchema, ComicSchema, PanelArraySchema, PanelSchema } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	CREATE_COMIC_RESPONSE,
	CREATE_COVER_IMAGE_RESPONSE,
	CREATE_PANEL_IMAGE_RESPONSE,
	CREATE_PANEL_RESPONSE,
	PING_RESPONSE,
} from '../../../../tests/mock/openAi/openAiResponse';
import { ACTION, globalActions } from '../actions';
import { ByokValuesSchema } from '../byok';
import { CreateComicValuesSchema, type CreateComicResult } from '../createComic';
import { CreateCoverImageValuesSchema, type CreateCoverImageResult } from '../createCoverImage';
import { CreatePanelValuesSchema, type CreatePanelResult } from '../createPanel';
import { CreatePanelImageValuesSchema, type CreatePanelImageResult } from '../createPanelImage';

const cookesSetSpy = vi.fn();

describe('actions', () => {
	beforeEach(() => {
		cookesSetSpy.mockClear();
	});

	describe('ACTION.CLIENT', () => {
		it('should return a ok', async () => {
			expect((await globalActions[ACTION.CLIENT]()).success).toEqual(true);
		});
	});

	describe('ACTION.BYOK', () => {
		it('should set the byok', async () => {
			const values = generateMock(ByokValuesSchema);
			const responseSpy = vi.fn().mockResolvedValueOnce(PING_RESPONSE);

			const result = await globalActions[ACTION.BYOK](getMockRequestEvent(values, responseSpy));

			expect(result.success).toBeTruthy();
		});

		it('should return error if invalid data is provided', async () => {
			const values = {};
			const responseSpy = vi.fn().mockResolvedValueOnce(PING_RESPONSE);

			await expect(
				globalActions[ACTION.BYOK](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);
			const responseSpy = vi.fn().mockRejectedValue(new Error(''));

			await expect(
				globalActions[ACTION.BYOK](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});
	});

	describe('ACTION.CREATE_COMIC', () => {
		it('should return a comic', async () => {
			const values = generateMock(CreateComicValuesSchema);
			const responseSpy = vi
				.fn()
				.mockResolvedValueOnce(CREATE_COMIC_RESPONSE)
				.mockResolvedValueOnce(CREATE_COVER_IMAGE_RESPONSE);

			const result = (await globalActions[ACTION.CREATE_COMIC](
				getMockRequestEvent(values, responseSpy),
			)) as CreateComicResult;

			expect(result.comic.id).toBeDefined();
		});

		it('should return error if no data is provided', async () => {
			const values = {};
			const responseSpy = vi
				.fn()
				.mockResolvedValueOnce(CREATE_COMIC_RESPONSE)
				.mockResolvedValueOnce(CREATE_COVER_IMAGE_RESPONSE);

			await expect(
				globalActions[ACTION.CREATE_COMIC](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);
			const responseSpy = vi.fn().mockRejectedValue(new Error(''));

			await expect(
				globalActions[ACTION.CREATE_COMIC](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});
	});

	describe('ACTION.CREATE_PANEL', () => {
		it('should return a panel', async () => {
			const values = {
				...generateMock(CreatePanelValuesSchema),
				panelsJsonString: JSON.stringify(generateMock(PanelArraySchema)),
			};
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_PANEL_RESPONSE);

			const result = (await globalActions[ACTION.CREATE_PANEL](
				getMockRequestEvent(values, responseSpy),
			)) as CreatePanelResult;

			expect(result.panel.id).toBeDefined();
		});

		it('should return error if invalid data is provided', async () => {
			const values = {};
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_PANEL_RESPONSE);

			await expect(
				globalActions[ACTION.CREATE_PANEL](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);
			const responseSpy = vi.fn().mockRejectedValue(new Error(''));

			await expect(
				globalActions[ACTION.CREATE_PANEL](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});
	});

	describe('ACTION.CREATE_PANEL_IMAGE', () => {
		it('should return a image', async () => {
			const values = {
				...generateMock(CreatePanelImageValuesSchema),
				charactersJsonString: JSON.stringify([generateMock(CharacterSchema)]),
				panelJsonString: JSON.stringify(generateMock(PanelSchema)),
			};
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_PANEL_IMAGE_RESPONSE);

			const result = (await globalActions[ACTION.CREATE_PANEL_IMAGE](
				getMockRequestEvent(values, responseSpy),
			)) as CreatePanelImageResult;

			expect(result.image).toBeDefined();
		});

		it('should return error if invalid data is provided', async () => {
			const values = {};
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_PANEL_IMAGE_RESPONSE);

			await expect(
				globalActions[ACTION.CREATE_PANEL_IMAGE](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);
			const responseSpy = vi.fn().mockRejectedValue(new Error(''));

			await expect(
				globalActions[ACTION.CREATE_PANEL_IMAGE](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});
	});

	describe('ACTION.CREATE_COVER_IMAGE', () => {
		it('should return a image', async () => {
			const values = {
				...generateMock(CreateCoverImageValuesSchema),
				comicJsonString: JSON.stringify(generateMock(ComicSchema)),
			};
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_COVER_IMAGE_RESPONSE);

			const result = (await globalActions[ACTION.CREATE_COVER_IMAGE](
				getMockRequestEvent(values, responseSpy),
			)) as CreateCoverImageResult;

			expect(result.image).toBeDefined();
		});

		it('should return error if invalid data is provided', async () => {
			const values = {};
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_COVER_IMAGE_RESPONSE);

			await expect(
				globalActions[ACTION.CREATE_COVER_IMAGE](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);
			const responseSpy = vi.fn().mockRejectedValue(new Error(''));

			await expect(
				globalActions[ACTION.CREATE_COVER_IMAGE](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});
	});
});

function getFormData(values: Record<string, string | number | boolean>) {
	const formData = new FormData();
	Object.entries(values).forEach(([key, value]) => {
		formData.set(key, value.toString());
	});
	return formData;
}

function getMockRequestEvent(
	values: Record<string, string | number | boolean>,
	responsesSpy: typeof vi.fn,
) {
	return {
		request: {
			formData: async () => {
				return getFormData(values);
			},
		},
		fetch: async () => {
			return {
				ok: true,
				json: responsesSpy,
			};
		},
		cookies: {
			get: vi.fn(),
			set: cookesSetSpy,
		},
	} as unknown as RequestEvent;
}
