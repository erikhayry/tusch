import z from 'zod';
import { PanelArraySchema, PanelSchema } from '..';

export function parseAsJson(val: unknown): unknown {
	if (typeof val === 'string') {
		try {
			return JSON.parse(val);
		} catch {
			return val;
		}
	}
	return val;
}

export const PanelSchemaJson = z.preprocess(parseAsJson, PanelSchema);
export const PanelArraySchemaJson = z.preprocess(parseAsJson, PanelArraySchema);
