import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { generateMock } from '$lib/test/utils/generateMock';
import { CharacterSchema, PanelSchema, ResponsivePanelImageSchema } from '$lib/types';
import { describe, expect, it } from 'vitest';
import {
	CreatePanelImageValuesSchema,
	decodeCreatePanelImageValues,
	toCreatePanelImageValues,
	toPanelImagePrompt,
} from '../createPanelImage';

const panel = { ...generateMock(PanelSchema), image: generateMock(ResponsivePanelImageSchema) };
const character = { ...generateMock(CharacterSchema) };

function baseEntries(extra: Record<string, string> = {}) {
	const values = toCreatePanelImageValues('comic-1', panel, [character], 'anime');

	return {
		panel: JSON.stringify(values.panel),
		comicId: 'comic-1',
		style: 'anime',
		characters: JSON.stringify(values.characters),
		instructions: 'make it dusk',
		...extra,
	};
}

function parse(entries: Record<string, string>) {
	return CreatePanelImageValuesSchema.safeParse(decodeCreatePanelImageValues(formDataOf(entries)));
}

describe('createPanelImage contract', () => {
	it('decodes a valid submission', () => {
		expect(parse(baseEntries())).toMatchObject({
			success: true,
			data: { comicId: 'comic-1', style: 'anime', instructions: 'make it dusk' },
		});
	});

	it('decodes an unchecked includeImage checkbox as false and a checked one as true', () => {
		expect(parse(baseEntries())).toMatchObject({ data: { includeImage: false } });
		expect(parse(baseEntries({ includeImage: 'on' }))).toMatchObject({
			data: { includeImage: true },
		});
	});

	it('keeps boolean-looking instructions as text', () => {
		expect(parse(baseEntries({ instructions: 'false' }))).toMatchObject({
			data: { instructions: 'false' },
		});
	});

	it('rejects malformed panel JSON', () => {
		expect(parse(baseEntries({ panel: '{bad' })).success).toBe(false);
	});

	it('sends only the panel fields the image prompt uses', () => {
		expect(Object.keys(toPanelImagePrompt(panel)).sort()).toEqual(
			[
				'captions',
				'dialogue',
				'id',
				'place',
				'season',
				'timeOfDay',
				'visualDescription',
				'year',
			].sort(),
		);
	});

	it('sends characters without image file references', () => {
		const values = toCreatePanelImageValues('comic-1', panel, [character], 'anime');

		expect(values.characters[0]).not.toHaveProperty('images');
		expect(values.panel).not.toHaveProperty('image');
	});
});
