import { expect, test } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createComicWithoutImages, createCompleteComic } from './createdComic';

// The tests of these requirements still read the examples; #326 rewrites them.
const ALLOWED = [
	'src/routes/(local)/test/examples.svelte.e2e.ts', // REQ-004
	'src/routes/(local)/test/home.svelte.e2e.ts', // REQ-295-1
	'src/routes/(local)/test/welcome.svelte.e2e.ts', // REQ-234-1/2
	'src/routes/(local)/test/storage.svelte.e2e.ts', // REQ-026
	'src/tests/e2e/examples.ts', // the helper those tests share
	'src/tests/e2e/createdComic.e2e.ts', // this file names the paths below
];
const EXAMPLE_IMPORT = /from\s+['"][^'"]*(?:\/examples\/examples|\/examples|e2e\/examples)['"]/;

async function testFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) {
				return entry.name === '__screenshots__' ? [] : testFiles(path);
			}
			return /\.(ts|js)$/.test(entry.name) ? [path] : [];
		}),
	);
	return nested.flat();
}

test('only the example requirements tests import the bundled examples', async () => {
	const importers: string[] = [];
	for (const file of [...(await testFiles('src/routes')), ...(await testFiles('src/tests'))]) {
		const path = relative(process.cwd(), file);
		if (!ALLOWED.includes(path) && EXAMPLE_IMPORT.test(await readFile(file, 'utf8'))) {
			importers.push(path);
		}
	}
	expect(importers).toEqual([]);
});

test('a comic made through the UI can be complete', { tag: ['@REQ-035'] }, async ({ page }) => {
	const comic = await createCompleteComic(page);
	expect(comic.cover).toBeDefined();
	expect(comic.characters.length).toBeGreaterThan(1);
	for (const panel of comic.panels) {
		expect(panel.image).toBeDefined();
	}
	for (const character of comic.characters) {
		const used = comic.panels.some((panel) =>
			panel.dialogue.some((line) => line.characterId === character.id),
		);
		if (used) {
			expect(character.images.length).toBeGreaterThan(0);
		}
	}
});

test('a comic made without images has none', async ({ page }) => {
	const comic = await createComicWithoutImages(page);
	expect(comic.panels.every((panel) => !panel.image)).toBe(true);
});
