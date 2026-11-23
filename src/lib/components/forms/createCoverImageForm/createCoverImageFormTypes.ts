import { CreateCoverImageValuesSchema } from '#lib/features/comics/contracts/createCoverImage.ts';
import { GLOBAL_INSTRUCTIONS_VALUE_KEY } from '#lib/features/settings/contracts/globalInstructions.ts';
import { EXISTING_IMAGE_VALUE_KEY } from '#lib/features/panels/contracts/createPanelImage.ts';
import { INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '#lib/utils/db/dbTypes.ts';
import { z } from 'zod';

export const CreateCoverImageFormPropsSchema = z.object({
	label: z.string(),
	values: CreateCoverImageValuesSchema.omit({
		[INSTRUCTIONS_VALUE_KEY]: true,
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: true,
		[INCLUDE_IMAGE_VALUE_KEY]: true,
		[EXISTING_IMAGE_VALUE_KEY]: true,
	}),
	/** Asset id of the variant the cover already has; set when this form makes the other one (REQ-280-1). */
	baseImage: z.string().optional(),
});

export type CreateCoverImageFormProps = z.infer<typeof CreateCoverImageFormPropsSchema>;
