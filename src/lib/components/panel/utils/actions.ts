import { removeImage, updateField } from '$lib/utils/db/db';
import { FIELD } from '$lib/utils/db/dbTypes';

export const ACTION = {
	DELETE_IMAGE: 'deleteImage',
	EDIT: 'edit',
} as const;

export const panelActions = {
	[ACTION.DELETE_IMAGE]: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const comicId = formData.get('comicId');
		const panelId = formData.get('panelId');

		if (comicId && panelId) {
			removeImage(comicId.toString(), panelId.toString());
		}
	},

	[ACTION.EDIT]: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const comicId = formData.get('comicId');
		const panelId = formData.get('panelId');
		const index = formData.get('index');
		const field = FIELD.parse(formData.get('field'));
		const value = formData.get('value');

		if (comicId && panelId && field && value && index) {
			updateField(
				comicId.toString(),
				panelId.toString(),
				field,
				Number.parseInt(index.toString()),
				value.toString(),
			);
		}
	},
};
