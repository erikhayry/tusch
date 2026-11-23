import { SettingSchema } from '#lib/types/index.ts';
import z from 'zod';

export const SettingPropsSchema = z.object({
	setting: SettingSchema,
});

export type SettingProps = z.infer<typeof SettingPropsSchema>;
