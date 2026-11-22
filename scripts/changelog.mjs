// The changelog is one file per issue in changelog/, so two open PRs never edit
// the same lines (the shared CHANGELOG.md conflicted on almost every merge).
//
//   node scripts/changelog.mjs          print the changelog as Markdown
//   node scripts/changelog.mjs check    fail on a badly named or malformed entry
//
// An entry is changelog/<issue>.<feature|fix|chore>.md and holds one user-facing
// sentence on a single line. The rules for writing one are in changelog/README.md.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('../changelog/', import.meta.url));
const ISSUE_URL = 'https://github.com/erikhayry/tusch/issues/';
const SECTIONS = [
	['feature', 'Features'],
	['fix', 'Fixes'],
	['chore', 'Chores'],
];
const NAME = new RegExp(`^(\\d+)\\.(${SECTIONS.map(([type]) => type).join('|')})\\.md$`);
const IGNORED = new Set(['README.md']);

function readEntries() {
	const entries = [];
	const problems = [];
	for (const file of readdirSync(DIR).sort()) {
		if (IGNORED.has(file)) {
			continue;
		}
		const match = NAME.exec(file);
		if (!match) {
			problems.push(`${file}: name must be <issue>.<feature|fix|chore>.md`);
			continue;
		}
		const lines = readFileSync(DIR + file, 'utf8')
			.trim()
			.split('\n');
		const [text] = lines;
		if (lines.length !== 1 || text === '') {
			problems.push(`${file}: must hold exactly one line, the release note`);
			continue;
		}
		if (/^[-#*]/.test(text)) {
			problems.push(`${file}: write the sentence only, without a list marker or heading`);
			continue;
		}
		entries.push({ issue: Number(match[1]), type: match[2], text });
	}
	return { entries, problems };
}

function render(entries) {
	const out = ['# Changelog', '', '## Unreleased'];
	for (const [type, heading] of SECTIONS) {
		// Issue numbers grow over time, so the highest number is the newest entry.
		const section = entries.filter((e) => e.type === type).sort((a, b) => b.issue - a.issue);
		if (section.length === 0) {
			continue;
		}
		out.push('', `### ${heading}`, '');
		for (const e of section) {
			out.push(`- ${e.text} ([#${e.issue}](${ISSUE_URL}${e.issue}))`);
		}
	}
	return out.join('\n');
}

const { entries, problems } = readEntries();
if (problems.length > 0) {
	console.error(problems.map((p) => `changelog/${p}`).join('\n'));
	process.exit(1);
}
if (process.argv[2] === 'check') {
	console.log(`changelog ok (${entries.length} entries)`);
} else {
	console.log(render(entries));
}
