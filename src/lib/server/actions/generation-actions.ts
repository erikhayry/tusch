import {
	CreateComicValuesSchema,
	decodeCreateComicValues,
	type CreateComicResult,
} from '$lib/features/comics/contracts/createComic';
import {
	CreateCoverImageValuesSchema,
	decodeCreateCoverImageValues,
	type CreateCoverImageResult,
} from '$lib/features/comics/contracts/createCoverImage';
import {
	CreatePanelValuesSchema,
	decodeCreatePanelValues,
	type CreatePanelResult,
} from '$lib/features/panels/contracts/createPanel';
import {
	CreatePanelImageValuesSchema,
	decodeCreatePanelImageValues,
	type CreatePanelImageResult,
} from '$lib/features/panels/contracts/createPanelImage';
import type { RequestEvent } from '@sveltejs/kit';
import type { GenerationService } from '../generation/generation-service';
import { runGeneration, type ActionResult } from './run-action';

type Options = { service?: GenerationService };

export function createComicAction(
	event: RequestEvent,
	{ service }: Options = {},
): ActionResult<CreateComicResult> {
	return runGeneration(
		event,
		{ decode: decodeCreateComicValues, schema: CreateComicValuesSchema },
		(generation, values) => generation.createComic(values),
		service,
	);
}

export function createCoverImageAction(
	event: RequestEvent,
	{ service }: Options = {},
): ActionResult<CreateCoverImageResult> {
	return runGeneration(
		event,
		{ decode: decodeCreateCoverImageValues, schema: CreateCoverImageValuesSchema },
		(generation, values) => generation.createCoverImage(values),
		service,
	);
}

export function createPanelAction(
	event: RequestEvent,
	{ service }: Options = {},
): ActionResult<CreatePanelResult> {
	return runGeneration(
		event,
		{ decode: decodeCreatePanelValues, schema: CreatePanelValuesSchema },
		(generation, values) => generation.createPanel(values),
		service,
	);
}

export function createPanelImageAction(
	event: RequestEvent,
	{ service }: Options = {},
): ActionResult<CreatePanelImageResult> {
	return runGeneration(
		event,
		{ decode: decodeCreatePanelImageValues, schema: CreatePanelImageValuesSchema },
		(generation, values) => generation.createPanelImage(values),
		service,
	);
}
