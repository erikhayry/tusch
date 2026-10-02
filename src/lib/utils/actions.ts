import { deleteType, editType } from '$lib/utils/db/db';
import {
	DeleteValuesSchema,
	EditValuesSchema,
	type DeleteValues,
	type EditValues,
} from '$lib/utils/db/dbTypes';

export const ACTION = {
	DELETE: 'delete',
	EDIT: 'edit',
} as const;

function getIndex(formData: FormData): number {
	return Number.parseInt(formData.get('index')?.toString() ?? '');
}

async function getDeleteValues(request: Request): Promise<DeleteValues> {
	const formData = await request.formData();

	return DeleteValuesSchema.parse({
		comicId: formData.get('comicId'),
		panelId: formData.get('panelId'),
		index: getIndex(formData),
		type: formData.get('type'),
	});
}

async function getEditValues(request: Request): Promise<EditValues> {
	const formData = await request.formData();

	return EditValuesSchema.parse({
		comicId: formData.get('comicId'),
		panelId: formData.get('panelId'),
		index: getIndex(formData),
		type: formData.get('type'),
		value: formData.get('value'),
	});
}

export const globalActions = {
	[ACTION.DELETE]: async ({ request }: { request: Request }) => {
		deleteType(await getDeleteValues(request));
	},

	[ACTION.EDIT]: async ({ request }: { request: Request }) => {
		editType(await getEditValues(request));
	},
};
