import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Contract for `scripts/check-e2e-stability.mjs` (`pnpm run check:e2e-stability`):
 * `node scripts/check-e2e-stability.mjs [--root <dir>]` inspects `<root>/e2e/**` and
 * `<root>/playwright.config.ts` (default root: the repository). It exits 0 when the
 * suite has no fixed waits (`waitForTimeout`, `setTimeout`, `sleep`) and no non-zero
 * `retries`; otherwise it exits non-zero and prints each offending file.
 */
const SCRIPT = 'scripts/check-e2e-stability.mjs';
const CLEAN_CONFIG = 'export default { retries: 0 };\n';

function run(root?: string): { code: number; output: string } {
	try {
		const output = execFileSync('node', [SCRIPT, ...(root ? ['--root', root] : [])], {
			encoding: 'utf8',
			stdio: 'pipe',
		});
		return { code: 0, output };
	} catch (error) {
		const failure = error as { status?: number; stdout?: string; stderr?: string };
		return { code: failure.status ?? 1, output: `${failure.stdout ?? ''}${failure.stderr ?? ''}` };
	}
}

function fixture(files: Record<string, string>): string {
	const root = mkdtempSync(join(tmpdir(), 'e2e-stability-'));
	mkdirSync(join(root, 'e2e'));
	for (const [name, content] of Object.entries(files)) {
		writeFileSync(join(root, name), content);
	}
	return root;
}

test.describe('the E2E stability check', () => {
	test(
		'passes on this repository: no fixed waits in e2e/ and no retries',
		{ tag: '@REQ-263-1' },
		() => {
			expect(run()).toMatchObject({ code: 0 });
		},
	);

	for (const [name, snippet] of [
		['waitForTimeout', 'await page.waitForTimeout(500);'],
		['setTimeout', 'await new Promise((r) => setTimeout(r, 500));'],
	]) {
		test(`fails on a ${name} in e2e/`, { tag: '@REQ-263-1' }, () => {
			const root = fixture({ 'playwright.config.ts': CLEAN_CONFIG, 'e2e/a.e2e.ts': snippet });
			try {
				const { code, output } = run(root);
				expect(code).not.toBe(0);
				expect(output).toContain('a.e2e.ts');
			} finally {
				rmSync(root, { recursive: true });
			}
		});
	}

	test('fails on non-zero retries in the Playwright config', { tag: '@REQ-263-1' }, () => {
		const root = fixture({
			'playwright.config.ts': 'export default { retries: 2 };\n',
			'e2e/a.e2e.ts': 'export {};\n',
		});
		try {
			const { code, output } = run(root);
			expect(code).not.toBe(0);
			expect(output).toContain('retries');
		} finally {
			rmSync(root, { recursive: true });
		}
	});

	test('passes on a clean fixture', { tag: '@REQ-263-1' }, () => {
		const root = fixture({ 'playwright.config.ts': CLEAN_CONFIG, 'e2e/a.e2e.ts': 'export {};\n' });
		try {
			expect(run(root)).toMatchObject({ code: 0 });
		} finally {
			rmSync(root, { recursive: true });
		}
	});
});
