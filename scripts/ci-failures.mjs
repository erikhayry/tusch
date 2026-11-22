// Turns Playwright's JSON report into a short Markdown list of the tests that
// failed or were flaky. CI prints it on the run's summary page and uploads it as
// the `ci-failures` artifact, which scripts/checks-bounce.sh quotes when it sends
// a failed PR back to the developer.
//
//   node scripts/ci-failures.mjs <playwright-results.json>
//
// Prints nothing when the report is missing (a step before the tests failed).
import { existsSync, readFileSync } from 'node:fs';

const MAX_ERROR_LENGTH = 300;
const ANSI = new RegExp(`${String.fromCodePoint(27)}\\[[0-9;]*m`, 'g');

function firstError(test) {
	for (const result of test.results ?? []) {
		const message = result.error?.message ?? result.errors?.[0]?.message;
		if (message) {
			return message.replace(ANSI, '').split('\n')[0].slice(0, MAX_ERROR_LENGTH);
		}
	}
	return '';
}

function collect(suite, found) {
	for (const spec of suite.specs ?? []) {
		for (const test of spec.tests ?? []) {
			if (test.status === 'unexpected' || test.status === 'flaky') {
				found[test.status].push({
					where: `${spec.file}:${spec.line}`,
					title: spec.title,
					error: firstError(test),
				});
			}
		}
	}
	for (const child of suite.suites ?? []) {
		collect(child, found);
	}
}

function section(heading, tests) {
	if (tests.length === 0) {
		return [];
	}
	const lines = [`**${heading}**`, ''];
	for (const t of tests) {
		lines.push(`- \`${t.where}\` ${t.title}${t.error ? `: ${t.error}` : ''}`);
	}
	return [...lines, ''];
}

const [file] = process.argv.slice(2);
if (file && existsSync(file)) {
	const report = JSON.parse(readFileSync(file, 'utf8'));
	const found = { unexpected: [], flaky: [] };
	for (const suite of report.suites ?? []) {
		collect(suite, found);
	}
	const out = [
		...section('Failed tests', found.unexpected),
		...section('Flaky tests (passed on retry)', found.flaky),
	];
	if (out.length > 0) {
		console.log(out.join('\n').trimEnd());
	}
}
