import { PresetStyleEnum } from '#lib/types/index.ts';
import { expect, test } from '@playwright/test';
import { execFile } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const SCRIPT = 'scripts/style-swatches.mjs';
const BASE_URL = 'http://localhost:4173';
const API_KEY = 'sk-test-style-swatches-key';
const PRESETS = PresetStyleEnum.options;

type Run = { code: number; output: string };

/** Runs the script the way the owner does: a child process with its own env and `--out`. */
function runScript(args: string[], env: Record<string, string | undefined>): Promise<Run> {
	return new Promise((resolve) => {
		execFile(
			'node',
			[SCRIPT, '--base-url', BASE_URL, ...args],
			{ env: { ...process.env, OPENAI_API_KEY: undefined, ...env } },
			(error, stdout, stderr) => {
				const code = error && typeof error.code === 'number' ? error.code : error ? 1 : 0;
				resolve({ code, output: `${stdout}${stderr}` });
			},
		);
	});
}

const seed = (out: string, id: string) => writeFile(path.join(out, `${id}.webp`), `old-${id}`);

let out: string;

test.beforeEach(async () => {
	out = await mkdtemp(path.join(tmpdir(), 'swatches-'));
});

test.afterEach(async () => {
	await rm(out, { recursive: true, force: true });
});

test(
	'the script makes one non-empty swatch per preset style',
	{ tag: ['@REQ-316-1', '@REQ-316-2'] },
	async () => {
		test.setTimeout(120_000);
		const run = await runScript(['--out', out], { OPENAI_API_KEY: API_KEY });

		expect(run.code, run.output).toBe(0);
		expect(run.output).not.toContain(API_KEY);
		expect((await readdir(out)).sort()).toEqual(PRESETS.map((id) => `${id}.webp`).sort());
		for (const id of PRESETS) {
			expect((await readFile(path.join(out, `${id}.webp`))).length).toBeGreaterThan(0);
		}
	},
);

test('--style updates only the named styles', { tag: ['@REQ-316-2'] }, async () => {
	for (const id of PRESETS) {
		await seed(out, id);
	}
	const run = await runScript(['--out', out, '--style', 'anime', '--style', 'noir'], {
		OPENAI_API_KEY: API_KEY,
	});

	expect(run.code, run.output).toBe(0);
	for (const id of PRESETS) {
		const content = (await readFile(path.join(out, `${id}.webp`))).toString();
		if (id === 'anime' || id === 'noir') {
			expect(content, id).not.toBe(`old-${id}`);
		} else {
			expect(content, id).toBe(`old-${id}`);
		}
	}
});

test('an unknown style exits before any file is written', { tag: ['@REQ-316-2'] }, async () => {
	const run = await runScript(['--out', out, '--style', 'nope'], { OPENAI_API_KEY: API_KEY });

	expect(run.code).not.toBe(0);
	expect(run.output).toContain('nope');
	expect(await readdir(out)).toEqual([]);
});

test('a failed style is reported by id and its file is kept', { tag: ['@REQ-316-3'] }, async () => {
	await seed(out, 'anime');
	const run = await runScript(['--out', out, '--style', 'anime'], {
		OPENAI_API_KEY: `${API_KEY}-mock-error:no-image`,
	});

	expect(run.code).not.toBe(0);
	expect(run.output).toContain('anime');
	expect(run.output).not.toContain(API_KEY);
	expect((await readFile(path.join(out, 'anime.webp'))).toString()).toBe('old-anime');
});

test(
	'without OPENAI_API_KEY the script exits with a message and writes nothing',
	{ tag: ['@REQ-316-3'] },
	async () => {
		const run = await runScript(['--out', out], {});

		expect(run.code).not.toBe(0);
		expect(run.output).toContain('OPENAI_API_KEY');
		expect(await readdir(out)).toEqual([]);
	},
);
