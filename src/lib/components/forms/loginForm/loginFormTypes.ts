import { z } from 'zod';

export const LoginFormPropsSchema = z.object({});

export type LoginFormProps = z.infer<typeof LoginFormPropsSchema>;
