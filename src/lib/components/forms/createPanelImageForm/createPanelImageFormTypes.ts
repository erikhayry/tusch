import {
	CreatePanelImageValuesSchema,
	EXISTING_IMAGE_VALUE_KEY,
	REFERENCE_IMAGES_KEY,
} from '#lib/features/panels/contracts/createPanelImage.ts';
import { CharacterReferenceGroupSchema } from '#lib/features/comics/client/comic-selectors.ts';
import { GLOBAL_INSTRUCTIONS_VALUE_KEY } from '#lib/features/settings/contracts/globalInstructions.ts';
import { ImageVariantEnum } from '#lib/types/index.ts';
import { INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '#lib/utils/db/dbTypes.ts';
import { z } from 'zod';

export const CreatePanelImageFormPropsSchema = z.object({
	label: z.string(),
	values: CreatePanelImageValuesSchema.omit({
		[INSTRUCTIONS_VALUE_KEY]: true,
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: true,
		[INCLUDE_IMAGE_VALUE_KEY]: true,
		[REFERENCE_IMAGES_KEY]: true,
		[EXISTING_IMAGE_VALUE_KEY]: true,
	}),
	imageName: z.string().optional(),
	/** The variant `imageName` is; sets the preview's orientation (REQ-172-1). */
	imageVariant: ImageVariantEnum.optional(),
	/** Asset id of the variant the panel image already has; set when this form makes the other one (REQ-279-1). */
	baseImage: z.string().optional(),
	characterReferences: z.array(CharacterReferenceGroupSchema),
	onSuccess: z.function({ input: [], output: z.void() }).optional(),
});

export type CreatePanelImageFormProps = z.infer<typeof CreatePanelImageFormPropsSchema>;
