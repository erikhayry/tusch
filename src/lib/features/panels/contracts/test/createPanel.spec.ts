import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { generateMock } from '$lib/test/utils/generateMock';
import { PanelArraySchema, ResponsivePanelImageSchema } from '$lib/types';
import { describe, expect, it } from 'vitest';
import {
	CreatePanelValuesSchema,
	decodeCreatePanelValues,
	toCreatePanelValues,
} from '../createPanel';

const panels = generateMock(PanelArraySchema);

function parse(entries: Record<string, string>) {
	return CreatePanelValuesSchema.safeParse(decodeCreatePanelValues(formDataOf(entries)));
}

describe('createPanel contract', () => {
	it('decodes comic id, panels and a numeric index', () => {
		expect(
			parse({
				comicId: 'comic-1',
				panels: JSON.stringify(toCreatePanelValues('comic-1', panels, 0).panels),
				index: '1',
			}),
		).toMatchObject({ success: true, data: { comicId: 'comic-1', index: 1 } });
	});

	it('keeps a numeric-looking comic id as text', () => {
		expect(parse({ comicId: '123', panels: '[]', index: '0' })).toMatchObject({
			success: true,
			data: { comicId: '123' },
		});
	});

	it('rejects malformed panels JSON', () => {
		expect(parse({ comicId: 'comic-1', panels: '[not json', index: '0' }).success).toBe(false);
	});

	it('rejects a non-integer index', () => {
		expect(parse({ comicId: 'comic-1', panels: '[]', index: '1.5' }).success).toBe(false);
	});

	it('removes panel image assets from the values sent to the AI', () => {
		const withImage = panels.map((panel) => ({
			...panel,
			image: generateMock(ResponsivePanelImageSchema),
		}));
		const result = CreatePanelValuesSchema.parse({
			comicId: 'comic-1',
			index: 0,
			panels: withImage.map((panel) => ({ ...panel, hasImage: true })),
		});

		result.panels.forEach((panel) => expect(panel).not.toHaveProperty('image'));
		expect(result.panels[0].hasImage).toBe(true);
	});
});
