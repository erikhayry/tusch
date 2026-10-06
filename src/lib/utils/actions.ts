import { addImage, deleteType, editType } from '$lib/utils/db/db';
import {
	CreateImageValuesSchema,
	DeleteValuesSchema,
	EditValuesSchema,
	type CreateImageValues,
	type DeleteValues,
	type EditValues,
} from '$lib/utils/db/dbTypes';
import type { CreateImageResponse } from '../../routes/api/chat/image/createImageApiTypes';

export const ACTION = {
	DELETE: 'delete',
	EDIT: 'edit',
	CREATE_IMAGE: 'create-image',
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

async function getCreateImageValues(request: Request): Promise<CreateImageValues> {
	const formData = await request.formData();

	return CreateImageValuesSchema.parse({
		comicId: formData.get('comicId'),
		panelId: formData.get('panelId'),
	});
}

export const globalActions = {
	[ACTION.DELETE]: async ({ request }: { request: Request }) => {
		deleteType(await getDeleteValues(request));
	},

	[ACTION.EDIT]: async ({ request }: { request: Request }) => {
		editType(await getEditValues(request));
	},

	[ACTION.CREATE_IMAGE]: async ({
		request,
		fetch,
	}: {
		request: Request;
		fetch: typeof globalThis.fetch;
	}) => {
		const { comicId, panelId } = await getCreateImageValues(request);

		const imageResponse = await fetch('/api/chat/image', {
			method: 'POST',
			body: JSON.stringify({ panelId, comicId }),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const image: CreateImageResponse = await imageResponse.json();

		addImage(comicId, panelId, {
			wide: { src: image.src, width: image.width, height: image.height },
			narrow: { src: image.src, width: image.width, height: image.height },
			alt: image.alt,
		});
	},
};
