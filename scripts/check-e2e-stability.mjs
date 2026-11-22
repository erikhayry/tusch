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

/** Replace everything but line breaks with spaces, so reported line numbers stay right. */
function blank(text) {
	return text.replace(/[^\n]/g, ' ');
}

/** Index just past the comment or string literal starting at `i`, or -1 if none starts there. */
function literalEnd(source, i) {
	const char = source[i];
	const next = source[i + 1];
	if (char === '/' && next === '/') {
		const end = source.indexOf('\n', i);
		return end === -1 ? source.length : end;
	}
	if (char === '/' && next === '*') {
		const end = source.indexOf('*/', i + 2);
		return end === -1 ? source.length : end + 2;
	}
	if (char === "'" || char === '"' || char === '`') {
		return quotedEnd(source, i);
	}
	return -1;
}

/** Quoted strings end at their line; only template literals may span lines. */
function quotedEnd(source, start) {
	const quote = source[start];
	let j = start + 1;
	while (j < source.length && source[j] !== quote) {
		if (quote !== '`' && source[j] === '\n') {
			break;
		}
		j += source[j] === '\\' ? 2 : 1;
	}
	return Math.min(j + 1, source.length);
}

/**
 * Blank out comments and string literals. A fixed wait is code; the same word in a comment
 * or a fixture string is not.
 */
function stripCommentsAndStrings(source) {
	let out = '';
	let i = 0;
	while (i < source.length) {
		const end = literalEnd(source, i);
		if (end === -1) {
			out += source[i];
			i += 1;
		} else {
			out += blank(source.slice(i, end));
			i = end;
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

/** Problems in one test file: fixed waits and fixed timeouts, by line. */
function checkSource(name, source) {
	const problems = [];
	stripCommentsAndStrings(source)
		.split('\n')
		.forEach((line, index) => {
			const where = `${name}:${index + 1}`;
			if (FIXED_WAIT.test(line)) {
				problems.push(`${where}: fixed wait (${line.trim()})`);
			}
			if (FIXED_TIMEOUT.test(line)) {
				problems.push(`${where}: fixed timeout (${line.trim()})`);
			}
		});
	return problems;
}

/** Problems in the Playwright config: any retries value other than 0. */
function checkConfig(source) {
	const problems = [];
	for (const match of stripCommentsAndStrings(source).matchAll(RETRIES)) {
		if (match[1] !== '0') {
			problems.push(`playwright.config.ts: retries must be 0 (found retries: ${match[1]})`);
		}
	}
	return problems;
}

function findProblems(rootDir) {
	const e2eDir = join(rootDir, 'e2e');
	let files;
	try {
		files = listTestFiles(e2eDir);
	} catch {
		return [`${relative(rootDir, e2eDir) || 'e2e'}: no e2e/ directory to check`];
	}

	const testProblems = files.flatMap((file) =>
		checkSource(relative(rootDir, file), readFileSync(file, 'utf8')),
	);
	const configSource = readFileSync(join(rootDir, 'playwright.config.ts'), 'utf8');
	return [...testProblems, ...checkConfig(configSource)];
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
