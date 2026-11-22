#!/usr/bin/env node
// Fails when the E2E suite contains something that makes tests flaky: a fixed wait in
// e2e/, a fixed per-step timeout, or Playwright retries. See docs/rules/testing.md, "Stability".
//
// Usage: node scripts/check-e2e-stability.mjs [--root <dir>]
// The default root is the repository; tests point it at a fixture directory.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const FIXED_WAIT = /\b(waitForTimeout|setTimeout|setInterval|sleep)\b/;
// A numeric per-step timeout (`{ timeout: 5000 }`). A variable or a shared constant is fine.
const FIXED_TIMEOUT = /\btimeout\s*:\s*\d/;
const RETRIES = /\bretries\s*:\s*([^,}\s]+)/g;

const args = process.argv.slice(2);
const rootIndex = args.indexOf('--root');
const root = rootIndex === -1 ? new URL('..', import.meta.url).pathname : args[rootIndex + 1];
if (!root) {
	console.error('check-e2e-stability: --root needs a directory');
	process.exit(2);
}

/**
 * Blank out comments and string literals, keeping the line breaks so reported line numbers
 * stay right. A fixed wait is code; the same word in a comment or a fixture string is not.
 */
function stripCommentsAndStrings(source) {
	let out = '';
	let i = 0;
	const blank = (text) => text.replace(/[^\n]/g, ' ');
	while (i < source.length) {
		const char = source[i];
		const next = source[i + 1];
		if (char === '/' && next === '/') {
			const end = source.indexOf('\n', i);
			const stop = end === -1 ? source.length : end;
			out += blank(source.slice(i, stop));
			i = stop;
		} else if (char === '/' && next === '*') {
			const end = source.indexOf('*/', i + 2);
			const stop = end === -1 ? source.length : end + 2;
			out += blank(source.slice(i, stop));
			i = stop;
		} else if (char === "'" || char === '"' || char === '`') {
			// Quoted strings end at their line; only template literals may span lines.
			let j = i + 1;
			while (j < source.length && source[j] !== char) {
				if (char !== '`' && source[j] === '\n') {
					break;
				}
				j += source[j] === '\\' ? 2 : 1;
			}
			const stop = Math.min(j + 1, source.length);
			out += blank(source.slice(i, stop));
			i = stop;
		} else {
			out += char;
			i += 1;
		}
	}
	return out;
}

function listTestFiles(e2eDir) {
	return readdirSync(e2eDir, { recursive: true })
		.filter((name) => name.endsWith('.ts'))
		.map((name) => join(e2eDir, name))
		.sort();
}

function findProblems(rootDir) {
	const problems = [];
	const e2eDir = join(rootDir, 'e2e');
	let files;
	try {
		files = listTestFiles(e2eDir);
	} catch {
		return [`${relative(rootDir, e2eDir) || 'e2e'}: no e2e/ directory to check`];
	}

	for (const file of files) {
		const code = stripCommentsAndStrings(readFileSync(file, 'utf8'));
		const name = relative(rootDir, file);
		code.split('\n').forEach((line, index) => {
			if (FIXED_WAIT.test(line)) {
				problems.push(`${name}:${index + 1}: fixed wait (${line.trim()})`);
			}
			if (FIXED_TIMEOUT.test(line)) {
				problems.push(`${name}:${index + 1}: fixed timeout (${line.trim()})`);
			}
		});
	}

	const configPath = join(rootDir, 'playwright.config.ts');
	const config = stripCommentsAndStrings(readFileSync(configPath, 'utf8'));
	for (const match of config.matchAll(RETRIES)) {
		if (match[1] !== '0') {
			problems.push(`playwright.config.ts: retries must be 0 (found retries: ${match[1]})`);
		}
	}
	return problems;
}

// Only run the check when executed directly, so the functions above can be imported.
if (import.meta.filename === process.argv[1]) {
	const problems = findProblems(root);
	if (problems.length > 0) {
		console.error('E2E stability check failed:');
		for (const problem of problems) {
			console.error(`  ${problem}`);
		}
		process.exit(1);
	}
	console.log('E2E stability check passed: no fixed waits, fixed timeouts or retries.');
}
