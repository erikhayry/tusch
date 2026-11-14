#!/usr/bin/env node
// Agent trust measurement (#181): how often the human goes with the planner's
// suggested answers, and how often a pipeline PR is merged without friction.
// One trust.csv row per planner round and per merged PR.
//
//   node scripts/trust.mjs header
//   node scripts/trust.mjs plan <issue>     row from the latest `<!-- trust:plan … -->` marker
//   node scripts/trust.mjs pr <pr>          row for a merged PR on a branch issue-<n>-…
//   node scripts/trust.mjs summary <trust.csv>   Markdown for the weekly audit
//
// Context from env: RUN_URL (optional), GH_REPO (optional). Like costs.mjs this
// never fails: when gh fails or data is missing, it prints nothing and exits 0,
// because bookkeeping must not block the pipeline. This only measures; acting on
// the numbers is #182.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const COLUMNS = [
	'date',
	'kind',
	'issue',
	'pr',
	'asked',
	'accepted',
	'changed',
	'review_comments',
	'changes_requested',
	'triage_rounds',
	'clean',
	'run_url',
];

const MARKER = /<!-- trust:plan asked=(\d+) accepted=(\d+) changed=(\d+) -->/;
const RECENT_ISSUES = 10;

// CSV-safe: no commas, quotes or newlines inside a field.
const field = (value) => String(value ?? '').replace(/[",\n\r]/g, ' ');

const csvRow = (values) => COLUMNS.map((column) => field(values[column])).join(',');

const today = () => new Date().toISOString().slice(0, 10);

function gh(args) {
	return execFileSync('gh', args, {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
		stdio: ['ignore', 'pipe', 'ignore'],
	});
}

// All pages of a list endpoint, reduced to the fields we use (one JSON object per line).
function list(path) {
	const projection = '{login: .user.login, type: .user.type, body: (.body // ""), state: .state}';
	return gh(['api', '--paginate', path, '--jq', `.[] | ${projection}`])
		.split('\n')
		.filter(Boolean)
		.map((line) => JSON.parse(line));
}

const isBot = (item) => item.type === 'Bot' || String(item.login ?? '').endsWith('[bot]');

function planRow(issue) {
	const marker = list(`repos/{owner}/{repo}/issues/${issue}/comments`)
		.map((comment) => MARKER.exec(comment.body))
		.findLast(Boolean);
	if (!marker) return '';
	const [, asked, accepted, changed] = marker;
	return csvRow({
		date: today(),
		kind: 'plan',
		issue,
		asked,
		accepted,
		changed,
		run_url: process.env.RUN_URL,
	});
}

function prRow(pr) {
	const info = JSON.parse(gh(['pr', 'view', String(pr), '--json', 'headRefName,mergedAt']));
	const issue = /^issue-(\d+)-/.exec(info.headRefName ?? '')?.[1];
	if (!issue || !info.mergedAt) return '';

	const human = (items) => items.filter((item) => !isBot(item));
	const inline = human(list(`repos/{owner}/{repo}/pulls/${pr}/comments`));
	const reviews = list(`repos/{owner}/{repo}/pulls/${pr}/reviews`);
	const conversation = human(list(`repos/{owner}/{repo}/issues/${pr}/comments`));
	const reviewBodies = human(reviews).filter((review) => review.body.trim() !== '');
	const reviewComments = inline.length + reviewBodies.length + conversation.length;
	const changesRequested = human(reviews).filter((r) => r.state === 'CHANGES_REQUESTED').length;
	const triageRounds = list(`repos/{owner}/{repo}/issues/${issue}/comments`).filter((comment) =>
		comment.body.startsWith('### Triage'),
	).length;

	return csvRow({
		date: today(),
		kind: 'pr',
		issue,
		pr,
		review_comments: reviewComments,
		changes_requested: changesRequested,
		triage_rounds: triageRounds,
		clean: reviewComments + changesRequested + triageRounds === 0,
		run_url: process.env.RUN_URL,
	});
}

function readRows(csv) {
	const [, ...lines] = readFileSync(csv, 'utf8').trim().split('\n');
	return lines
		.filter(Boolean)
		.map((line) => Object.fromEntries(line.split(',').map((v, i) => [COLUMNS[i], v])));
}

const percent = (part, whole) => (whole === 0 ? 'n/a' : `${Math.round((part / whole) * 100)} %`);
const sum = (rows, key) => rows.reduce((total, r) => total + (Number(r[key]) || 0), 0);

// Rows of the last N distinct issues, ordered by their latest row in the file.
function lastIssues(rows) {
	const latest = new Map(rows.map((r, index) => [r.issue, index]));
	const recent = new Set(
		[...latest]
			.sort((a, b) => b[1] - a[1])
			.slice(0, RECENT_ISSUES)
			.map(([issue]) => issue),
	);
	return rows.filter((r) => recent.has(r.issue));
}

function summary(csv) {
	let rows = [];
	try {
		rows = readRows(csv);
	} catch {
		// Missing file: same as an empty one.
	}
	const plans = rows.filter((r) => r.kind === 'plan');
	const prs = rows.filter((r) => r.kind === 'pr');
	if (plans.length === 0 && prs.length === 0) return 'No trust data yet.';

	const recentPlans = lastIssues(plans);
	const recentPrs = lastIssues(prs);
	const clean = (items) => items.filter((r) => r.clean === 'true').length;
	const issues = (items) => new Set(items.map((r) => r.issue)).size;
	return [
		'## Trust',
		'',
		`| Measure | Last ${RECENT_ISSUES} issues | All time |`,
		'| --- | ---: | ---: |',
		`| Planner answers accepted | ${percent(sum(recentPlans, 'accepted'), sum(recentPlans, 'asked'))} (${sum(recentPlans, 'accepted')} of ${sum(recentPlans, 'asked')}, ${issues(recentPlans)} issues) | ${percent(sum(plans, 'accepted'), sum(plans, 'asked'))} (${sum(plans, 'accepted')} of ${sum(plans, 'asked')}, ${issues(plans)} issues) |`,
		`| PRs merged clean | ${percent(clean(recentPrs), recentPrs.length)} (${clean(recentPrs)} of ${recentPrs.length}) | ${percent(clean(prs), prs.length)} (${clean(prs)} of ${prs.length}) |`,
		'',
		'A planner answer is accepted when it matches the suggestion. A PR is clean when it had no human review comments, no changes requested and no `/triage` rounds.',
		'',
	].join('\n');
}

const [command, arg] = process.argv.slice(2);
const handlers = {
	header: () => COLUMNS.join(','),
	plan: () => planRow(arg),
	pr: () => prRow(arg),
	summary: () => summary(arg),
};
if (!handlers[command]) {
	console.error('usage: trust.mjs header | plan <issue> | pr <pr> | summary <trust.csv>');
	process.exit(2);
}
let output = '';
try {
	output = arg || command === 'header' ? handlers[command]() : '';
} catch {
	// gh failed or data is missing: print nothing, never block.
}
if (output) console.log(output);
