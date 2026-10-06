import { addImage, addPanel, deleteType, editType } from '$lib/utils/db/db';
import {
	CreateImageValuesSchema,
	CreatePanelValuesSchema,
	DeleteValuesSchema,
	EditValuesSchema,
	type CreateImageValues,
	type CreatePanelValues,
	type DeleteValues,
	type EditValues,
} from '$lib/utils/db/dbTypes';
import type { CreateImageResponse } from '../../routes/api/chat/image/createImageApiTypes';
import type { CreatePanelResponse } from '../../routes/api/chat/panel/createPanelApiTypes';

export const ACTION = {
	DELETE: 'delete',
	EDIT: 'edit',
	CREATE_IMAGE: 'create-image',
	CREATE_PANEL: 'create-panel',
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

async function getCreatePanelValues(request: Request): Promise<CreatePanelValues> {
	const formData = await request.formData();

	return CreatePanelValuesSchema.parse({
		comicId: formData.get('comicId'),
		index: Number.parseInt(formData.get('index')!.toString()),
	});
}

export const globalActions = {
	[ACTION.DELETE]: async ({ request }: { request: Request }) => {
		deleteType(await getDeleteValues(request));
	},

	[ACTION.EDIT]: async ({ request }: { request: Request }) => {
		editType(await getEditValues(request));
	},

	[ACTION.CREATE_PANEL]: async ({
		request,
		fetch,
	}: {
		request: Request;
		fetch: typeof globalThis.fetch;
	}) => {
		const { comicId, index } = await getCreatePanelValues(request);

		const panelResponse = await fetch('/api/chat/panel', {
			method: 'POST',
			body: JSON.stringify({ comicId, index }),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const panel: CreatePanelResponse = await panelResponse.json();

		addPanel(comicId, panel, index);
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
