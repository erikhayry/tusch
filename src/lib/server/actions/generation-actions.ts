import {
	CreateComicValuesSchema,
	decodeCreateComicValues,
	explainCreateComicError,
	type CreateComicResult,
} from '#lib/features/comics/contracts/createComic.ts';
import {
	CreateCoverImageValuesSchema,
	decodeCreateCoverImageValues,
	type CreateCoverImageResult,
} from '#lib/features/comics/contracts/createCoverImage.ts';
import {
	CreatePanelValuesSchema,
	decodeCreatePanelValues,
	type CreatePanelResult,
} from '#lib/features/panels/contracts/createPanel.ts';
import {
	CreatePanelImageValuesSchema,
	decodeCreatePanelImageValues,
	type CreatePanelImageResult,
} from '#lib/features/panels/contracts/createPanelImage.ts';
import {
	decodeFixCharacterCropValues,
	FixCharacterCropValuesSchema,
	type FixCharacterCropResult,
} from '#lib/features/panels/contracts/fixCharacterCrop.ts';
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
		{
			decode: decodeCreateComicValues,
			schema: CreateComicValuesSchema,
			failureMessage: explainCreateComicError,
		},
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

export function fixCharacterCropAction(
	event: RequestEvent,
	{ service }: Options = {},
): ActionResult<FixCharacterCropResult> {
	return runGeneration(
		event,
		{ decode: decodeFixCharacterCropValues, schema: FixCharacterCropValuesSchema },
		(generation, values) => generation.fixCharacterCrop(values),
		service,
	);
}
