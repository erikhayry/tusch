import {
	getByokValues,
	getCreateComicValues,
	getCreateCoverImageValues,
	getCreatePanelImageValues,
	getCreatePanelValues,
} from '$lib/components/forms/utils/values';
import type { Comic, Panel, ResponsiveImage } from '$lib/types';
import { error, fail, type Action, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
import {
	getComicFromOpenAiResponse,
	getImageFromOpenAiResponse,
	getPanelFromOpenAiResponse,
} from '../ai/ai';
import { SchemaName } from '../ai/aiTypes';
import {
	buildCoverImageMessages,
	buildInitialMessages,
	buildPanelImageMessages,
	buildPanelMessages,
} from '../ai/utils/messages';
import { IMAGE_SIZE } from '../ai/utils/settings';
import { generateId } from '../id';
import { getCookieArgs } from '../key';

function getPostRequestInit(body: unknown) {
	return {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
		},
	};
}

export const ACTION = {
	CLIENT: 'client',
	CREATE_PANEL_IMAGE: 'create-panel-image',
	CREATE_COVER_IMAGE: 'create-cover-image',
	CREATE_PANEL: 'create-panel',
	CREATE_COMIC: 'create-comic',
	BYOK: 'byok',
} as const;

export type CreateComicResult = { comic: Comic; output: unknown };
export type CreatePanelResult = { comicId: string; index: number; panel: Panel; output: unknown };
export type CreatePanelImageResult = {
	panelId: string;
	comicId: string;
	image: ResponsiveImage;
	output: unknown;
};
export type CreateCoverImageResult = { comicId: string; image: ResponsiveImage; output: unknown };
export type ByokResult = { success: boolean };
type ActionResult<T> = Promise<T | ActionFailure<{ message: string }>>;
export const globalActions = {
	[ACTION.BYOK]: async ({ request, cookies, fetch }: RequestEvent): ActionResult<ByokResult> => {
		const result = await getByokValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		const { key } = result.data;

		cookies.set(...getCookieArgs(key));

		try {
			const response = await fetch('/api/ai/ping');
			const responseJson = await response.json();

			return {
				success: responseJson.status,
			};
		} catch {
			return fail(500, { message: 'Failed to set byok cookie' });
		}
	},

	[ACTION.CLIENT]: async () => {
		return {
			success: true,
		};
	},

	[ACTION.CREATE_COMIC]: async ({
		request,
		fetch,
	}: RequestEvent): ActionResult<CreateComicResult> => {
		const result = await getCreateComicValues(await request.formData());

		if (!result.success) {
			return fail(500, { message: result.error.message });
		}

		const { url, style } = result.data;
		const comicMessagesJsonString = JSON.stringify(buildInitialMessages(url, style));

		try {
			const initComicResponse = await fetch(
				'/api/ai/comic',
				getPostRequestInit({
					messagesJsonString: comicMessagesJsonString,
					schemaName: SchemaName.enum.initComic,
				}),
			);
			const initComicResponseJson = await initComicResponse.json();
			const initialComic = getComicFromOpenAiResponse(initComicResponseJson);

			const comic: Comic = {
				id: generateId(),
				source: url,
				...initialComic,
				panels: initialComic.panels.map((initialPanel) => ({
					...initialPanel,
					id: generateId(),
				})),
			};

			const coverImageMessagesJsonString = JSON.stringify(buildCoverImageMessages({ comic }));
			const coverImageResponse = await fetch(
				'/api/ai/cover-image',
				getPostRequestInit({
					messagesJsonString: coverImageMessagesJsonString,
					schemaName: SchemaName.enum.createImage,
					size: IMAGE_SIZE.PORTRAIT,
				}),
			);
			const coverImageResponseJson = await coverImageResponse.json();
			const createdImage = getImageFromOpenAiResponse(coverImageResponseJson);
			const serializableImage = structuredClone(createdImage);

			return {
				comic: {
					...comic,
					cover: {
						landscape: serializableImage,
						portrait: serializableImage,
						alt: serializableImage.alt,
					},
				},
				output: {
					init: initComicResponseJson.output,
					coverImage: coverImageResponseJson.output,
				},
			};
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error occurred';
			return error(500, { message });
		}
	},

	[ACTION.CREATE_PANEL]: async ({
		request,
		fetch,
	}: RequestEvent): ActionResult<CreatePanelResult> => {
		const result = await getCreatePanelValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		try {
			const { panelsJsonString, index, comicId } = result.data;

			const messagesJsonString = JSON.stringify(
				buildPanelMessages(index, JSON.parse(panelsJsonString)),
			);

			const response = await fetch(
				'/api/ai/panel',
				getPostRequestInit({
					messagesJsonString,
					schemaName: SchemaName.enum.createPanel,
				}),
			);
			const responseJson = await response.json();
			const panel = getPanelFromOpenAiResponse(responseJson);

			return {
				comicId,
				index,
				panel,
				output: responseJson.output,
			};
		} catch (e: unknown) {
			return error(500, (e as Error).message);
		}
	},

	[ACTION.CREATE_COVER_IMAGE]: async ({
		request,
		fetch,
	}: RequestEvent): ActionResult<CreateCoverImageResult> => {
		const result = await getCreateCoverImageValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		try {
			const { comicJsonString, instructions, includeImage, imageUrl } = result.data;
			const comic = JSON.parse(comicJsonString);
			const messagesJsonString = JSON.stringify(buildCoverImageMessages({ comic }));
			const response = await fetch(
				'/api/ai/cover-image',
				getPostRequestInit({
					messagesJsonString,
					schemaName: SchemaName.enum.createImage,
					size: IMAGE_SIZE.PORTRAIT,
					instructions,
					imageUrl: includeImage ? imageUrl : undefined,
				}),
			);
			const responseJson = await response.json();
			const createdImage = getImageFromOpenAiResponse(responseJson);
			const serializableImage = structuredClone(createdImage);

			return {
				output: responseJson.output,
				comicId: comic.id,
				image: {
					landscape: serializableImage,
					portrait: serializableImage,
					alt: serializableImage.alt,
				},
			};
		} catch (e: unknown) {
			return error(500, (e as Error).message);
		}
	},

	[ACTION.CREATE_PANEL_IMAGE]: async ({
		request,
		fetch,
	}: RequestEvent): ActionResult<CreatePanelImageResult> => {
		const result = await getCreatePanelImageValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		const {
			comicId,
			panelJsonString,
			instructions,
			style,
			charactersJsonString,
			imageUrl,
			includeImage,
		} = result.data;

		const panel = JSON.parse(panelJsonString);
		const messagesJsonString = JSON.stringify(
			buildPanelImageMessages({
				panel,
				charactersJson: JSON.parse(charactersJsonString),
				instruction: instructions,
				style,
			}),
		);

		try {
			const response = await fetch(
				'/api/ai/panel-image',
				getPostRequestInit({
					messagesJsonString,
					schemaName: SchemaName.enum.createImage.toString(),
					size: IMAGE_SIZE.PORTRAIT,
					instructions,
					imageUrl: includeImage ? imageUrl : undefined,
				}),
			);
			const responseJson = await response.json();
			const createdImage = getImageFromOpenAiResponse(responseJson);
			const serializableImage = structuredClone(createdImage);

			return {
				comicId,
				panelId: panel.id,
				image: {
					landscape: serializableImage,
					portrait: serializableImage,
					alt: serializableImage.alt,
				},
				output: responseJson.output,
			};
		} catch (e: unknown) {
			return error(500, (e as Error).message);
		}
	},
} satisfies Record<string, Action>;
