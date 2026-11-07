import { generateMock } from '$lib/test/utils/generateMock';
import { PanelArraySchema } from '$lib/types';
import { INCLUDE_IMAGE_VALUE_KEY } from '$lib/utils/db/dbTypes';
import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	CreateComicValuesSchema,
	type CreateComicResult,
} from '$lib/features/comics/contracts/createComic';
import {
	CreateCoverImageValuesSchema,
	type CreateCoverImageResult,
} from '$lib/features/comics/contracts/createCoverImage';
import {
	CreatePanelValuesSchema,
	type CreatePanelResult,
} from '$lib/features/panels/contracts/createPanel';
import {
	CreatePanelImageValuesSchema,
	type CreatePanelImageResult,
} from '$lib/features/panels/contracts/createPanelImage';
import { ByokValuesSchema } from '$lib/features/settings/contracts/validateApiKey';
import { encodeFormValue } from '$lib/forms/form-data';
import {
	CREATE_COMIC_RESPONSE,
	CREATE_COVER_IMAGE_RESPONSE,
	CREATE_PANEL_IMAGE_RESPONSE,
	CREATE_PANEL_RESPONSE,
	PING_RESPONSE,
} from '../../../../tests/mock/openAi/openAiResponse';
import { ACTION, globalActions } from '../actions';

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

			expect(result).toMatchObject({ success: true });
		});

		it('should return a failure if invalid data is provided', async () => {
			const values = {};
			const responseSpy = vi.fn().mockResolvedValueOnce(PING_RESPONSE);

			const result = await globalActions[ACTION.BYOK](getMockRequestEvent(values, responseSpy));

			expect(result).toMatchObject({ status: 400, data: { code: 'invalid_input' } });
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(ByokValuesSchema);
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

		it('should return a failure if no data is provided', async () => {
			const values = {};
			const responseSpy = vi
				.fn()
				.mockResolvedValueOnce(CREATE_COMIC_RESPONSE)
				.mockResolvedValueOnce(CREATE_COVER_IMAGE_RESPONSE);

			const result = await globalActions[ACTION.CREATE_COMIC](
				getMockRequestEvent(values, responseSpy),
			);

			expect(result).toMatchObject({ status: 400, data: { code: 'invalid_input' } });
			expect(responseSpy).not.toHaveBeenCalled();
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

		it('should return a failure if invalid data is provided', async () => {
			const values = {};
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_PANEL_RESPONSE);

			const result = await globalActions[ACTION.CREATE_PANEL](
				getMockRequestEvent(values, responseSpy),
			);

			expect(result).toMatchObject({ status: 400, data: { code: 'invalid_input' } });
			expect(responseSpy).not.toHaveBeenCalled();
		});

		it('should return a failure with field errors for malformed panels JSON', async () => {
			const values = { ...generateMock(CreatePanelValuesSchema), panels: '[not json' };
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_PANEL_RESPONSE);

			const result = await globalActions[ACTION.CREATE_PANEL](
				getMockRequestEvent(values, responseSpy),
			);

			expect(result).toMatchObject({
				status: 400,
				data: { code: 'invalid_input', fieldErrors: { panels: expect.any(Array) } },
			});
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreatePanelValuesSchema);
			const responseSpy = vi.fn().mockRejectedValue(new Error(''));

			await expect(
				globalActions[ACTION.CREATE_PANEL](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});
	});

	describe('ACTION.CREATE_PANEL_IMAGE', () => {
		it('should return a panel image', async () => {
			const values = generateMock(CreatePanelImageValuesSchema);
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_PANEL_IMAGE_RESPONSE);

			const result = (await globalActions[ACTION.CREATE_PANEL_IMAGE](
				getMockRequestEvent(values, responseSpy),
			)) as CreatePanelImageResult;

			expect(result.image).toBeDefined();
		});

		it('should return a failure if invalid data is provided', async () => {
			const values = {};
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_PANEL_IMAGE_RESPONSE);

			const result = await globalActions[ACTION.CREATE_PANEL_IMAGE](
				getMockRequestEvent(values, responseSpy),
			);

			expect(result).toMatchObject({ status: 400, data: { code: 'invalid_input' } });
			expect(responseSpy).not.toHaveBeenCalled();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreatePanelImageValuesSchema);
			const responseSpy = vi.fn().mockRejectedValue(new Error(''));

			await expect(
				globalActions[ACTION.CREATE_PANEL_IMAGE](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});
	});

	describe('ACTION.CREATE_COVER_IMAGE', () => {
		it('should return a image', async () => {
			const values = generateMock(CreateCoverImageValuesSchema);
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_COVER_IMAGE_RESPONSE);

			const result = (await globalActions[ACTION.CREATE_COVER_IMAGE](
				getMockRequestEvent(values, responseSpy),
			)) as CreateCoverImageResult;

			expect(result.image).toBeDefined();
		});

		it('should return a failure if invalid data is provided', async () => {
			const values = {};
			const responseSpy = vi.fn().mockResolvedValueOnce(CREATE_COVER_IMAGE_RESPONSE);

			const result = await globalActions[ACTION.CREATE_COVER_IMAGE](
				getMockRequestEvent(values, responseSpy),
			);

			expect(result).toMatchObject({ status: 400, data: { code: 'invalid_input' } });
			expect(responseSpy).not.toHaveBeenCalled();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateCoverImageValuesSchema);
			const responseSpy = vi.fn().mockRejectedValue(new Error(''));

			await expect(
				globalActions[ACTION.CREATE_COVER_IMAGE](getMockRequestEvent(values, responseSpy)),
			).rejects.toThrow();
		});
	});
});

function getFormData(values: Record<string, unknown>) {
	const formData = new FormData();
	Object.entries(values).forEach(([key, value]) => {
		if (key === INCLUDE_IMAGE_VALUE_KEY) {
			if (value) formData.set(key, 'on');
			return;
		}
		formData.set(key, encodeFormValue(value));
	});
	return formData;
}

function getMockRequestEvent(values: Record<string, unknown>, responsesSpy: typeof vi.fn) {
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
