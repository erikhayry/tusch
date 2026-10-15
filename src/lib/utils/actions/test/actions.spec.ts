import { generateMock } from '$lib/test/utils/generateMock';
import { ComicSchema, PanelSchema } from '$lib/types';
import {
	ByokValuesSchema,
	CreateComicValuesSchema,
	CreatePanelValuesSchema,
} from '$lib/utils/db/dbTypes';
import type { ActionFailure, RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACTION, globalActions, type CreateComicResult, type CreatePanelResult } from '../actions';

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
		it.todo('should set the byok', async () => {
			const values = generateMock(ByokValuesSchema);
			const response = {
				success: true,
			};
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
		it.todo('should return a comic', async () => {
			const values = generateMock(CreateComicValuesSchema);
			const response = { comic: generateMock(ComicSchema), output: 'output' };

			const { comic } = (await globalActions[ACTION.CREATE_COMIC](
				getMockRequestEvent(values, response),
			)) as CreateComicResult;
		});

		it('should return error if no data is provided', async () => {
			const values = {};
			const response = generateMock(ComicSchema);

			const result = (await globalActions[ACTION.CREATE_COMIC](
				getMockRequestEvent(values, response),
			)) as unknown as ActionFailure;

			expect(result.status).toEqual(500);
		});

		it.todo('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);

			const result = await globalActions[ACTION.CREATE_COMIC](
				getMockFailedRequestEvent(values, 'error'),
			);
		});
	});

	describe('ACTION.CREATE_PANEL', () => {
		it.todo('should return a panel', async () => {
			const values = generateMock(CreatePanelValuesSchema);
			const response = {
				panel: generateMock(PanelSchema),
				output: 'outp',
			};

			const result = (await globalActions[ACTION.CREATE_PANEL](
				getMockRequestEvent(values, response),
			)) as CreatePanelResult;
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
		it.todo('should return a image', async () => {});

		it('should return error if invalid data is provided', async () => {
			const values = {};
			const response = generateMock(ComicSchema);

			await expect(
				globalActions[ACTION.CREATE_PANEL_IMAGE](getMockRequestEvent(values, response)),
			).rejects.toThrow();
		});

		it('should return error if response is invalid', async () => {
			const values = generateMock(CreateComicValuesSchema);

			await expect(
				globalActions[ACTION.CREATE_PANEL_IMAGE](getMockFailedRequestEvent(values, 'error')),
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
