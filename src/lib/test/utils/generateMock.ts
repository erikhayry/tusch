import { PanelSchema, SeasonEnum, TimeOfDayEnum } from '$lib/types';
import { vi } from 'vitest';
import { zocker } from 'zocker';
import z from 'zod';

export function generateMock<T extends z.ZodType>(schema: T): z.infer<T> {
	return zocker(schema)
		.setSeed(1)
		.override(z.ZodFunction, () => vi.fn())
		.generate() as z.infer<T>;
}

export function generateMocks<T extends z.ZodType>(schema: T, numberOfMocks: number): z.infer<T>[] {
	return zocker(schema)
		.setSeed(1)
		.optional({ undefined_chance: 0 })
		.supply(PanelSchema.shape.dialogue, [
			{
				text: 'Arbetare: Vi kräver bättre villkor och rätten att organisera oss.',
				characterId: 'cfb4c17e-4420-4a34-a709-29b16b608a8f',
			},
		])
		.supply(PanelSchema.shape.captions, [
			'Ådalen, Sverige – den 14 maj 1931. En vårdag som snart blir historisk.',
		])
		.supply(
			PanelSchema.shape.visualDescription,
			'En mångsidig grupp byggarbetare i skyddshjälmar och reflexvästar står tillsammans på en byggarbetsplats.',
		)
		.supply(PanelSchema.shape.place, 'Ådalen')
		.supply(PanelSchema.shape.season, SeasonEnum.enum.summer)
		.supply(PanelSchema.shape.timeOfDay, TimeOfDayEnum.enum.afternoon)
		.supply(PanelSchema.shape.year, 1931)
		.array({
			min: 3,
			max: 4,
		})
		.override(z.ZodFunction, () => vi.fn())
		.generateMany(numberOfMocks) as z.infer<T>[];
}
