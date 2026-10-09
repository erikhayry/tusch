import {
	type ByokValues,
	ByokValuesSchema,
	type CreateComicValues,
	CreateComicValuesSchema,
	type CreateImageValues,
	CreateImageValuesSchema,
	type CreatePanelValues,
	CreatePanelValuesSchema,
	type DeleteValues,
	DeleteValuesSchema,
	type EditValues,
	EditValuesSchema,
	INSTRUCTIONS_VALUE_KEY,
} from '$lib/utils/db/dbTypes';

function getIndex(formData: FormData): number {
	return Number.parseInt(formData.get('index')?.toString() ?? '');
}

export async function getEditValues(formData: FormData): Promise<EditValues> {
	return EditValuesSchema.parse({
		comicId: formData.get('comicId'),
		panelId: formData.get('panelId'),
		index: getIndex(formData),
		type: formData.get('type'),
		value: formData.get('value'),
	});
}

export async function getCreateComicValues(formData: FormData): Promise<CreateComicValues> {
	return CreateComicValuesSchema.parse({
		url: formData.get('url'),
		style: formData.get('style'),
	});
}

export async function getCreatePanelValues(formData: FormData): Promise<CreatePanelValues> {
	return CreatePanelValuesSchema.parse({
		comicId: formData.get('comicId'),
		panelsJsonString: formData.get('panelsJsonString'),
		index: Number.parseInt(formData.get('index')!.toString()),
	});
}

export async function getDeleteValues(formData: FormData): Promise<DeleteValues> {
	return DeleteValuesSchema.parse({
		comicId: formData.get('comicId'),
		panelId: formData.get('panelId'),
		index: getIndex(formData),
		type: formData.get('type'),
	});
}

export async function getCreateImageValues(formData: FormData): Promise<CreateImageValues> {
	return CreateImageValuesSchema.parse({
		comicId: formData.get('comicId'),
		panelJsonString: formData.get('panelJsonString'),
		[INSTRUCTIONS_VALUE_KEY]: formData.get(INSTRUCTIONS_VALUE_KEY),
	});
}

export async function getByokValues(formData: FormData): Promise<ByokValues> {
	return ByokValuesSchema.parse({
		key: formData.get('key'),
	});
}
