import type { ZodSafeParseResult } from 'zod';

export type ParsedValue<T> = Promise<ZodSafeParseResult<T>>;
