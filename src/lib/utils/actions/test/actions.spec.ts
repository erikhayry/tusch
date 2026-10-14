import { generateMock } from '$lib/test/utils/generateMock';
import { ComicSchema } from '$lib/types';
import { addComic } from '$lib/utils/db/db';
import {
	ByokValuesSchema,
	CreateComicValuesSchema,
	CreateImageValuesSchema,
	CreatePanelValuesSchema,
} from '$lib/utils/db/dbTypes';
import type { ActionFailure, RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreatePanelImageResponseSchema } from '../../../../routes/api/chat/image/createImageApiTypes';
import { ACTION, globalActions, type CreateImageResult } from '../actions';

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
			const response = {
				success: true,
			};

			expect(await globalActions[ACTION.BYOK](getMockRequestEvent(values, response))).toEqual(
				response,
			);
			expect(cookesSetSpy.mock.calls[0][1]).toEqual(values.key);
		});

		it('should return error if invalid data is provided', async () => {
			const values = {};
			const response = generateMock(ComicSchema);

			await expect(
				globalActions[ACTION.BYOK](getMockRequestEvent(values, response)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);

			await expect(
				globalActions[ACTION.BYOK](getMockFailedRequestEvent(values, 'error')),
			).rejects.toThrow();
		});
	});

	describe('ACTION.CREATE_COMIC', () => {
		it('should return a comic', async () => {
			const values = generateMock(CreateComicValuesSchema);
			const response = generateMock(ComicSchema);

			expect(
				await globalActions[ACTION.CREATE_COMIC](getMockRequestEvent(values, response)),
			).toEqual({ comic: response });
		});

		it('should return error if no data is provided', async () => {
			const values = {};
			const response = generateMock(ComicSchema);

			const result = (await globalActions[ACTION.CREATE_COMIC](
				getMockRequestEvent(values, response),
			)) as unknown as ActionFailure;

			expect(result.status).toEqual(500);
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);

			const result = await globalActions[ACTION.CREATE_COMIC](
				getMockFailedRequestEvent(values, 'error'),
			);

			expect(result).toEqual(
				expect.objectContaining({
					status: 500,
					data: {
						message: 'Failed to initialize comic',
					},
				}),
			);
		});
	});

	describe('ACTION.CREATE_PANEL', () => {
		it('should return a panel', async () => {
			const values = generateMock(CreatePanelValuesSchema);
			const response = generateMock(ComicSchema);

			const result = await globalActions[ACTION.CREATE_PANEL](
				getMockRequestEvent(values, response),
			);

			expect(result.comicId).toEqual(values.comicId);
			expect(result.panel).toBeDefined();
			expect(result.index).toEqual(values.index);
		});

		it('should return error if invalid data is provided', async () => {
			const values = {};
			const response = generateMock(ComicSchema);

			await expect(
				globalActions[ACTION.CREATE_PANEL](getMockRequestEvent(values, response)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);

			await expect(
				globalActions[ACTION.CREATE_PANEL](getMockFailedRequestEvent(values, 'error')),
			).rejects.toThrow();
		});
	});

	describe('ACTION.CREATE_IMAGE', () => {
		it('should return a image', async () => {
			const comicMock = generateMock(ComicSchema);
			const values = { ...generateMock(CreateImageValuesSchema), comicId: comicMock.id };
			addComic(comicMock);

			const response = generateMock(CreatePanelImageResponseSchema);

			const result = (await globalActions[ACTION.CREATE_IMAGE](
				getMockRequestEvent(values, response),
			)) as CreateImageResult;

			expect(result.comicId).toEqual(values.comicId);
			expect(result.image).toEqual(response.image);
		});

		it('should return error if invalid data is provided', async () => {
			const values = {};
			const response = generateMock(ComicSchema);

			await expect(
				globalActions[ACTION.CREATE_IMAGE](getMockRequestEvent(values, response)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);

			await expect(
				globalActions[ACTION.CREATE_IMAGE](getMockFailedRequestEvent(values, 'error')),
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

function getMockRequestEvent(values: Record<string, string | number | boolean>, response: unknown) {
	return {
		request: {
			formData: async () => {
				return getFormData(values);
			},
		},
		fetch: async () => {
			return {
				ok: true,
				json: vi.fn().mockResolvedValue(response),
			};
		},
		cookies: {
			get: vi.fn(),
			set: cookesSetSpy,
		},
	} as unknown as RequestEvent;
}

function getMockFailedRequestEvent(values: Record<string, string>, error: string) {
	return {
		request: {
			formData: async () => {
				return getFormData(values);
			},
		},
		fetch: async () => {
			return {
				json: vi.fn().mockRejectedValue(new Error(error)),
			};
		},
	} as unknown as RequestEvent;
}
