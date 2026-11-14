#!/usr/bin/env node
// Checks docs/requirements.md against the @REQ-… tags in the E2E tests.
// See docs/agent-workflow-plan.md §5.2 and docs/rules/testing.md.
//
// Ids: REQ-001 … REQ-052 are the legacy sequential ids and keep their numbers.
// New requirements are scoped to the issue that adds them: REQ-<issue>-<n>
// (REQ-98-1, REQ-98-2). Parallel tickets have different issue numbers, so their
// ids can't collide the way "next free number" did (#165).
const LAST_LEGACY_ID = 52;
const ID = /^REQ-(?:(\d{3})|([1-9]\d*)-([1-9]\d*))$/;
const TAG = /@REQ-\d+(?:-\d+)?/g;
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const ledgerPath = join(root, 'docs/requirements.md');
const errors = [];

// --- Ledger ---------------------------------------------------------------
const requirements = new Map();
let current = null;
for (const [index, line] of readFileSync(ledgerPath, 'utf8').split('\n').entries()) {
	const heading = line.match(/^### (\S+)\s+(.*)$/);
	if (heading) {
		const [, id, title] = heading;
		const parts = id.match(ID);
		if (!parts)
			errors.push(
				`docs/requirements.md:${index + 1}: malformed id "${id}" (new ids are REQ-<issue>-<n>)`,
			);
		else if (parts[1] && Number(parts[1]) > LAST_LEGACY_ID)
			errors.push(
				`docs/requirements.md:${index + 1}: ${id} takes a new sequential number; use REQ-<issue>-<n> instead`,
			);
		if (requirements.has(id)) errors.push(`docs/requirements.md:${index + 1}: duplicate id ${id}`);
		current = { id, title, status: null, gap: false };
		requirements.set(id, current);
		continue;
	}
	if (!current) continue;
	const status = line.match(/^- Status:\s*(\S+)/);
	if (status) current.status = status[1];
	if (/^- Proven by:\s*gap\b/.test(line)) current.gap = true;
}
for (const req of requirements.values()) {
	if (req.status !== 'active')
		errors.push(`${req.id}: Status must be "active" (delete obsolete requirements instead)`);
}

// --- Tests ----------------------------------------------------------------
function e2eFiles(dir) {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return e2eFiles(path);
		return name.endsWith('.e2e.ts') ? [path] : [];
	});
}

const tagged = new Map(); // id -> [test locations]
for (const file of e2eFiles(join(root, 'src'))) {
	const lines = readFileSync(file, 'utf8').split('\n');
	lines.forEach((line, index) => {
		const ids = line.match(TAG);
		if (!ids) return;
		const location = `${relative(root, file)}:${index + 1}`;
		// The tag may sit on its own line after `test(` (Prettier), so look back to the call.
		const call = lines
			.slice(Math.max(0, index - 3), index + 1)
			.reverse()
			.find((candidate) => /\btest(\.describe)?(\.\w+)?\(/.test(candidate));
		if (call && /\btest(\.describe)?\.(skip|fixme)\(/.test(call)) {
			errors.push(`${location}: skipped test is tagged; skipped tests don't prove a requirement`);
			return;
		}
		for (const tag of ids) {
			const id = tag.slice(1);
			if (!requirements.has(id)) errors.push(`${location}: tags unknown requirement ${id}`);
			tagged.set(id, [...(tagged.get(id) ?? []), location]);
		}
	});
}

// --- Coverage -------------------------------------------------------------
const gaps = [];
for (const req of requirements.values()) {
	const tests = tagged.get(req.id) ?? [];
	if (req.gap && tests.length > 0) {
		errors.push(`${req.id}: marked as a gap but proven by ${tests.join(', ')}; remove "gap"`);
	} else if (req.gap) {
		gaps.push(req);
	} else if (tests.length === 0) {
		errors.push(
			`${req.id}: no E2E test tags @${req.id} (tag one, or mark "Proven by: gap (#issue)")`,
		);
	}
}

console.log(
	`${requirements.size} requirements, ${requirements.size - gaps.length} proven, ${gaps.length} gaps`,
);
for (const gap of gaps) console.log(`  gap: ${gap.id} ${gap.title}`);

if (errors.length > 0) {
	console.error(`\n${errors.length} problem(s):`);
	for (const error of errors) console.error(`  ${error}`);
	process.exit(1);
}
