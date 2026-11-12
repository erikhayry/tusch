import { CreateCoverImageValuesSchema } from '$lib/features/comics/contracts/createCoverImage';
import { toCreatePanelValues } from '$lib/features/panels/contracts/createPanel';
import { CreatePanelImageValuesSchema } from '$lib/features/panels/contracts/createPanelImage';
import { generateMock } from '$lib/test/utils/generateMock';
import { PanelArraySchema } from '$lib/types';
import { describe, expect, it } from 'vitest';
import { createGenerationService, InvalidAiResponseError } from '../generation-service';
import { fakeGateway } from './fake-gateway';

const REFERENCE_IMAGE = 'data:image/png;base64,AAAA';

describe('GenerationService', () => {
	describe('createComic', () => {
		it('generates the comic text, then its cover, and returns one comic', async () => {
			const gateway = fakeGateway();
			const ids: string[] = [];
			const service = createGenerationService(gateway, () => {
				ids.push(crypto.randomUUID());
				return ids.at(-1)!;
			});

			const { comic } = await service.createComic({ url: 'https://example.com/a', style: 'anime' });

			expect(gateway.text).toHaveBeenCalledOnce();
			expect(gateway.text.mock.calls[0][0]).toMatchObject({ schemaName: 'initComic' });
			expect(gateway.text.mock.calls[0][0].messages).toContain('Source URL: https://example.com/a');
			expect(gateway.image).toHaveBeenCalledOnce();
			expect(comic.id).toBe(ids[0]);
			expect(comic.source).toBe('https://example.com/a');
			expect(comic.cover?.landscape.src).toBeTruthy();
			expect(new Set(comic.panels.map(({ id }) => id)).size).toBe(comic.panels.length);
		});

		it('does not request a cover when the text response is unusable', async () => {
			const gateway = fakeGateway({ text: async () => ({ output: [] }) });

			await expect(
				createGenerationService(gateway).createComic({
					url: 'https://example.com',
					style: 'anime',
				}),
			).rejects.toBeInstanceOf(InvalidAiResponseError);
			expect(gateway.image).not.toHaveBeenCalled();
		});
	});

	describe('createPanel', () => {
		it('requests a panel at the target index', async () => {
			const gateway = fakeGateway();
			const values = toCreatePanelValues('comic-1', generateMock(PanelArraySchema), 2);

			const result = await createGenerationService(gateway).createPanel(values);

			expect(gateway.text.mock.calls[0][0]).toMatchObject({ schemaName: 'createPanel' });
			expect(gateway.text.mock.calls[0][0].messages).toContain('Target insertion index: 2');
			expect(result).toMatchObject({ comicId: 'comic-1', index: 2, panel: expect.anything() });
		});
	});

	describe('createCoverImage', () => {
		const { comic } = generateMock(CreateCoverImageValuesSchema);

		it('omits the reference image unless included', async () => {
			const gateway = fakeGateway();

			await createGenerationService(gateway).createCoverImage({
				comic,
				instructions: 'sunny',
				imageUrl: REFERENCE_IMAGE,
			});

			expect(gateway.image.mock.calls[0][0]).toMatchObject({
				schemaName: 'createImage',
				size: '1024x1536',
				imageUrl: undefined,
			});
		});

		it('forwards the reference image and keeps instructions as text', async () => {
			const gateway = fakeGateway();

			const result = await createGenerationService(gateway).createCoverImage({
				comic,
				instructions: '123',
				imageUrl: REFERENCE_IMAGE,
				includeImage: true,
			});

			const request = gateway.image.mock.calls[0][0];
			expect(request.imageUrl).toBe(REFERENCE_IMAGE);
			expect(request.messages).toContain('USER INSTRUCTION: 123');
			expect(result.comicId).toBe(comic.id);
			expect(result.image.landscape).toEqual(result.image.portrait);
		});
	});

	describe('createPanelImage', () => {
		it('targets the submitted panel and forwards the reference image when included', async () => {
			const gateway = fakeGateway();
			const values = generateMock(CreatePanelImageValuesSchema);

			const result = await createGenerationService(gateway).createPanelImage({
				...values,
				instructions: 'false',
				imageUrl: REFERENCE_IMAGE,
				includeImage: true,
			});

			expect(gateway.image.mock.calls[0][0].imageUrl).toBe(REFERENCE_IMAGE);
			expect(gateway.image.mock.calls[0][0].messages).toContain('USER INSTRUCTION: false');
			expect(result).toMatchObject({ comicId: values.comicId, panelId: values.panel.id });
		});
	});

	it('surfaces gateway failures unchanged', async () => {
		const failure = new Error('boom');
		const gateway = fakeGateway({
			text: async () => {
				throw failure;
			},
		});

		await expect(
			createGenerationService(gateway).createPanel(toCreatePanelValues('c', [], 0)),
		).rejects.toBe(failure);
	});
});
