import {
	CreatePanelImageValuesSchema,
	REFERENCE_IMAGES_KEY,
} from '#lib/features/panels/contracts/createPanelImage.ts';
import { CharacterReferenceGroupSchema } from '#lib/features/comics/client/comic-selectors.ts';
import { GLOBAL_INSTRUCTIONS_VALUE_KEY } from '#lib/features/settings/contracts/globalInstructions.ts';
import { INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '#lib/utils/db/dbTypes.ts';
import { z } from 'zod';

export const CreatePanelImageFormPropsSchema = z.object({
	label: z.string(),
	values: CreatePanelImageValuesSchema.omit({
		[INSTRUCTIONS_VALUE_KEY]: true,
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: true,
		[INCLUDE_IMAGE_VALUE_KEY]: true,
		[REFERENCE_IMAGES_KEY]: true,
	}),
	imageName: z.string().optional(),
	characterReferences: z.array(CharacterReferenceGroupSchema),
});

export type CreatePanelImageFormProps = z.infer<typeof CreatePanelImageFormPropsSchema>;
