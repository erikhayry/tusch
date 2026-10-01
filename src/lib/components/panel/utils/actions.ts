import { removeFieldItem, removeImage, updateFieldItem } from '$lib/utils/db/db';
import { FIELD } from '$lib/utils/db/dbTypes';

export const ACTION = {
	DELETE_IMAGE: 'deleteImage',
	DELETE_FIELD_ITEM: 'deleteFieldItem',
	EDIT_FIELD_ITEM: 'editFieldItem',
} as const;

async function getFieldValues(request: Request) {
	const formData = await request.formData();
	const comicId = formData.get('comicId');
	const panelId = formData.get('panelId');
	const index = formData.get('index');
	const value = formData.get('value');
	const field = FIELD.safeParse(formData.get('field')).data;

	return { comicId, panelId, index, field, value };
}

export const panelActions = {
	[ACTION.DELETE_IMAGE]: async ({ request }: { request: Request }) => {
		const { comicId, panelId } = await getFieldValues(request);

		if (comicId && panelId) {
			removeImage(comicId.toString(), panelId.toString());
		}
	},

	[ACTION.DELETE_FIELD_ITEM]: async ({ request }: { request: Request }) => {
		const { comicId, panelId, index, field } = await getFieldValues(request);

		if (comicId && panelId && index && field) {
			removeFieldItem(
				comicId.toString(),
				panelId.toString(),
				field,
				Number.parseInt(index.toString()),
			);
		}
	},

	[ACTION.EDIT_FIELD_ITEM]: async ({ request }: { request: Request }) => {
		const { comicId, panelId, index, field, value } = await getFieldValues(request);

		if (comicId && panelId && field && value && index) {
			updateFieldItem(
				comicId.toString(),
				panelId.toString(),
				field,
				Number.parseInt(index.toString()),
				value.toString(),
			);
		}
	},
};
