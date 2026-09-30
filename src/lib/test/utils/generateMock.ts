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
		.array({
			min: 3,
			max: 4,
		})
		.override(z.ZodFunction, () => vi.fn())
		.generateMany(numberOfMocks) as z.infer<T>[];
}
