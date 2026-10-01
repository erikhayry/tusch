import z from 'zod';

export const FIELD = z.enum(['dialogue', 'captions']);
export type Field = z.infer<typeof FIELD>;
