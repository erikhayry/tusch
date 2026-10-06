import { zodTextFormat } from 'openai/helpers/zod.mjs';
import z from 'zod';
import { SCHEMA, type SchemaName } from '../aiTypes';

export function getSchemaAsTextFormat(schema: SchemaName) {
	return zodTextFormat(z.object({ data: SCHEMA[schema] }), schema);
}
