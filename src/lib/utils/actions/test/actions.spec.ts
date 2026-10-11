import { generateMock } from '$lib/test/utils/generateMock';
import { ComicSchema } from '$lib/types';
import { CreateComicValuesSchema, CreatePanelValuesSchema } from '$lib/utils/db/dbTypes';
import type { RequestEvent } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import { ACTION, globalActions } from '../actions';

describe('onSubmit', () => {
	describe('ACTION.CLIENT', () => {
		it('should return a ok', async () => {
			expect((await globalActions[ACTION.CLIENT]()).success).toEqual(true);
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

		it('should return error if invalid data is provided', async () => {
			const values = {};
			const response = generateMock(ComicSchema);

			await expect(
				globalActions[ACTION.CREATE_COMIC](getMockRequestEvent(values, response)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);

			await expect(
				globalActions[ACTION.CREATE_COMIC](getMockFailedRequestEvent(values, 'error')),
			).rejects.toThrow();
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
});

function getFormData(values: Record<string, string | number>) {
	const formData = new FormData();
	Object.entries(values).forEach(([key, value]) => {
		formData.set(key, value.toString());
	});
	return formData;
}

function getMockRequestEvent(values: Record<string, string | number>, response: unknown) {
	return {
		request: {
			formData: async () => {
				return getFormData(values);
			},
		},
		fetch: async () => {
			return {
				json: vi.fn().mockResolvedValue(response),
			};
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
