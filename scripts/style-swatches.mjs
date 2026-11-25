#!/usr/bin/env node
/**
 * Makes the swatch image for each preset comic style, for the style cards (#316).
 * The owner runs it locally with their own OpenAI key; the pipeline can't, since
 * AI is mocked in CI and in agent runs.
 *
 * Usage (run `pnpm run dev` first, then from the repo root):
 *
 *   OPENAI_API_KEY=sk-… node scripts/style-swatches.mjs [--style <id>]... [--base-url <url>] [--out <dir>]
 *
 *   OPENAI_API_KEY    Your OpenAI key. Sent as `Authorization: Bearer`; never printed.
 *   --style <id>      Make only this style. Repeat it for several. Other files are left alone.
 *                     Default: every preset style (Custom has no swatch).
 *   --base-url <url>  Where the app runs. Default http://localhost:5173.
 *   --out <dir>       Where `<style-id>.webp` is written. Default static/styles.
 *
 * One style at a time, each one a `POST /api/generate/panel-image` request. A style
 * that fails is reported by id, keeps its existing file, and the others still run.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

// The ten preset ids (REQ-306-1). The source is `PresetStyleEnum` in
// src/lib/types/index.ts; this plain Node script can't import it, so the E2E test
// fails when this list and that enum drift apart.
const PRESET_STYLES = [
	'anime',
	'classic-marvel',
	'franco-belgian',
	'manga',
	'noir',
	'newspaper-strip',
	'watercolour',
	'webtoon',
	'pop-art',
	'ukiyo-e',
];

const DEFAULT_BASE_URL = 'http://localhost:5173';
const DEFAULT_OUT = fileURLToPath(new URL('../static/styles', import.meta.url));

// One fixed scene for every style, so the cards differ only by style.
const SWATCH_PANEL = {
	id: '5b7e2c1a-8f4d-4e6a-9c3b-2a1d0e9f8b7c',
	visualDescription:
		'Head and shoulders of one character, facing the viewer, calm expression, plain background.',
	captions: [],
	dialogue: [],
	place: 'a quiet street',
	year: 1950,
	season: 'autumn',
	timeOfDay: 'morning',
};

const SWATCH_CHARACTER = {
	id: '0f9e8d7c-6b5a-4c3d-8e2f-1a0b9c8d7e6f',
	name: 'Mara',
	description: {
		apparentAge: 'late 20s',
		gender: 'female',
		ethnicityOrSpecies: 'Caucasian',
		facialFeatures: {
			faceShape: 'oval',
			eyeColorAndShape: 'almond-shaped grey eyes',
			hairStyleAndColor: 'shoulder-length auburn hair with a side part',
			facialHair: null,
			distinguishingMarks: null,
		},
		bodyType: 'slender',
		height: 'average',
		defaultOutfit: {
			top: 'navy knitted sweater',
			bottom: 'dark trousers',
			footwear: 'brown leather boots',
			accessories: [],
		},
		masterVisualPrompt: '28-year-old woman, shoulder-length auburn hair, grey eyes, navy sweater',
	},
};

function requestBody(style) {
	return {
		panel: SWATCH_PANEL,
		comicId: 'style-swatches',
		style,
		characters: [SWATCH_CHARACTER],
		instructions: '',
		globalInstructions: '',
		referenceImages: [],
		imageFormat: 'landscape',
	};
}

/** Returns the WebP bytes of one swatch. Throws with a message the owner can act on. */
async function makeSwatch(style, { baseUrl, apiKey }) {
	const url = `${baseUrl.replace(/\/$/, '')}/api/generate/panel-image`;
	let response;
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
			body: JSON.stringify(requestBody(style)),
		});
	} catch (error) {
		throw new Error(`could not reach ${url} (${error.message})`, { cause: error });
	}

	const body = await response.json().catch(() => undefined);
	if (!response.ok) {
		throw new Error(body?.message ?? `HTTP ${response.status}`);
	}

	// `src` is raw base64 WebP (the app adds the data-URL prefix itself, see asset-workflow.ts).
	const src = body?.image?.landscape?.src;
	if (typeof src !== 'string' || src.length === 0) {
		throw new Error('the response has no landscape image');
	}
	return Buffer.from(src, 'base64');
}

async function main(argv) {
	let values;
	try {
		({ values } = parseArgs({
			args: argv,
			strict: true,
			options: {
				style: { type: 'string', multiple: true },
				'base-url': { type: 'string', default: DEFAULT_BASE_URL },
				out: { type: 'string', default: DEFAULT_OUT },
			},
		}));
	} catch (error) {
		console.error(`${error.message}. See the usage at the top of scripts/style-swatches.mjs.`);
		process.exitCode = 1;
		return;
	}

	// Checked before any request, so a typo or a missing key costs nothing.
	const apiKey = process.env.OPENAI_API_KEY?.trim();
	if (!apiKey) {
		console.error('Set OPENAI_API_KEY to your OpenAI key, then run the script again.');
		process.exitCode = 1;
		return;
	}

	const styles = values.style?.length ? [...new Set(values.style)] : PRESET_STYLES;
	const unknown = styles.filter((id) => !PRESET_STYLES.includes(id));
	if (unknown.length > 0) {
		console.error(
			`Unknown style: ${unknown.join(', ')}. Known styles: ${PRESET_STYLES.join(', ')}.`,
		);
		process.exitCode = 1;
		return;
	}

	const out = path.resolve(values.out);
	await mkdir(out, { recursive: true });

	const failed = [];
	// Requests run one after another: a real key has rate limits, and a failure
	// then names the one style that failed.
	for (const style of styles) {
		const file = path.resolve(out, `${style}.webp`);
		try {
			// The id is from the fixed list, so this holds today; the check keeps every
			// write inside `out` if that list ever takes free text.
			if (!file.startsWith(`${out}${path.sep}`)) {
				throw new Error('the swatch would be written outside the output folder');
			}
			await writeFile(file, await makeSwatch(style, { baseUrl: values['base-url'], apiKey }));
			console.log(`${style}: wrote ${file}`);
		} catch (error) {
			failed.push(style);
			// The key is only ever in the header; redact it in case a message echoes it back.
			console.error(`${style}: ${error.message.replaceAll(apiKey, '[key]')}`);
		}
	}

	if (failed.length > 0) {
		console.error(`${failed.length} of ${styles.length} styles failed: ${failed.join(', ')}.`);
		process.exitCode = 1;
	}
}

await main(process.argv.slice(2));
