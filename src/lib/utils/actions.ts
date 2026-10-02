import { deleteType, editType } from '$lib/utils/db/db';
import { DB_ITEM_TYPE, DeleteValuesSchema, type DeleteValues } from '$lib/utils/db/dbTypes';

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

async function getFieldValues(request: Request) {
	const formData = await request.formData();
	const comicId = formData.get('comicId');
	const panelId = formData.get('panelId');
	const index = formData.get('index');
	const value = formData.get('value');
	const type = DB_ITEM_TYPE.safeParse(formData.get('field')).data;

	return { comicId, panelId, index, type, value };
}

export const globalActions = {
	[ACTION.DELETE]: async ({ request }: { request: Request }) => {
		deleteType(await getDeleteValues(request));
	},

	[ACTION.EDIT]: async ({ request }: { request: Request }) => {
		const { comicId, panelId, index, type, value } = await getFieldValues(request);

		if (comicId && panelId && type && value && index) {
			editType({
				comicId: comicId.toString(),
				panelId: panelId.toString(),
				type,
				index: Number.parseInt(index.toString()),
				value: value.toString(),
			});
		}
	},
};
