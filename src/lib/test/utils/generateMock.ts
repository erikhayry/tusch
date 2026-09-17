import { zocker } from 'zocker';
import type z from 'zod';

export function generateMock<T extends z.ZodType>(schema: T): z.infer<T> {
	return zocker(schema).setSeed(1).generate() as z.infer<T>;
}

export function generateMocks<T extends z.ZodType>(schema: T, numberOfMocks: number): z.infer<T>[] {
	return zocker(schema).setSeed(1).generateMany(numberOfMocks) as z.infer<T>[];
}
