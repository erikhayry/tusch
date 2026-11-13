#!/usr/bin/env node
// Agent bookkeeping (#50): one costs.csv row per agent run on GitHub.
//
//   node scripts/costs.mjs header
//   node scripts/costs.mjs row <execution-file>   context from env: ISSUE, SKILL,
//                                                 TARGET, CONCLUSION, RUN_URL
//   node scripts/costs.mjs summary <costs.csv> [issue]
//
// `row` reads claude-code-action's execution file: a JSON array (or JSON lines)
// of SDK messages whose last `type: result` message carries cost, turns and
// usage. Missing fields stay empty rather than failing: bookkeeping must never
// block the pipeline. total_cost_usd is an API-price estimate, not what a
// subscription is billed.
import { readFileSync } from 'node:fs';

const COLUMNS = [
	'date',
	'issue',
	'skill',
	'target',
	'model',
	'turns',
	'input_tokens',
	'output_tokens',
	'cache_read_tokens',
	'cache_write_tokens',
	'cost_usd',
	'duration_s',
	'conclusion',
	'run_url',
];

function parseMessages(text) {
	try {
		const parsed = JSON.parse(text);
		return Array.isArray(parsed) ? parsed : [parsed];
	} catch {
		return text
			.split('\n')
			.filter((line) => line.trim().startsWith('{'))
			.flatMap((line) => {
				try {
					return [JSON.parse(line)];
				} catch {
					return [];
				}
			});
	}
}

// CSV-safe: no commas, quotes or newlines inside a field.
const field = (value) => String(value ?? '').replace(/[",\n\r]/g, ' ');

function row(file) {
	let messages = [];
	try {
		messages = parseMessages(readFileSync(file, 'utf8'));
	} catch {
		// No execution file (the run failed before Claude started): record the run anyway.
	}
	const result = messages.findLast((message) => message?.type === 'result') ?? {};
	const init = messages.find((message) => message?.type === 'system' && message.subtype === 'init');
	const usage = result.usage ?? {};
	const env = process.env;
	return [
		new Date().toISOString().slice(0, 10),
		env.ISSUE,
		env.SKILL,
		env.TARGET,
		Object.keys(result.modelUsage ?? {}).join('+') || init?.model,
		result.num_turns,
		usage.input_tokens,
		usage.output_tokens,
		usage.cache_read_input_tokens,
		usage.cache_creation_input_tokens,
		typeof result.total_cost_usd === 'number' ? result.total_cost_usd.toFixed(4) : '',
		typeof result.duration_ms === 'number' ? Math.round(result.duration_ms / 1000) : '',
		env.CONCLUSION,
		env.RUN_URL,
	]
		.map(field)
		.join(',');
}

function readRows(csv) {
	const [, ...lines] = readFileSync(csv, 'utf8').trim().split('\n');
	return lines.map((line) => Object.fromEntries(line.split(',').map((v, i) => [COLUMNS[i], v])));
}

// ISO week start (Monday) of a YYYY-MM-DD date.
function weekOf(date) {
	const day = new Date(`${date}T00:00:00Z`);
	day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
	return day.toISOString().slice(0, 10);
}

function table(title, rows, keyOf) {
	const totals = new Map();
	for (const r of rows) {
		const key = keyOf(r) || '(none)';
		const t = totals.get(key) ?? { runs: 0, turns: 0, cost: 0 };
		t.runs += 1;
		t.turns += Number(r.turns) || 0;
		t.cost += Number(r.cost_usd) || 0;
		totals.set(key, t);
	}
	const lines = [...totals]
		.sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
		.map(([key, t]) => `| ${key} | ${t.runs} | ${t.turns} | $${t.cost.toFixed(2)} |`);
	return [
		`### ${title}`,
		'',
		`| ${title} | Runs | Turns | Est. cost |`,
		'| --- | ---: | ---: | ---: |',
		...lines,
		'',
	].join('\n');
}

function summary(csv, issue) {
	const rows = readRows(csv);
	if (issue) {
		const mine = rows.filter((r) => r.issue === issue);
		const cost = mine.reduce((sum, r) => sum + (Number(r.cost_usd) || 0), 0);
		return [
			'<!-- cost-so-far -->',
			'### Cost so far',
			'',
			`${mine.length} agent runs, est. **$${cost.toFixed(2)}** at API prices (not the subscription bill).`,
			'',
			table('Skill', mine, (r) => r.skill),
		].join('\n');
	}
	return [
		table('Issue', rows, (r) => (r.issue ? `#${r.issue}` : r.target)),
		table('Skill', rows, (r) => r.skill),
		table('Week', rows, (r) => weekOf(r.date)),
	].join('\n');
}

// The tool calls the run's permissions refused, one line each (shortened), so a
// silent run can be explained without the full transcript (agents.yml hand-off check).
function denials(file) {
	let messages;
	try {
		messages = parseMessages(readFileSync(file, 'utf8'));
	} catch {
		return '';
	}
	const result = messages.findLast((message) => message?.type === 'result') ?? {};
	return (result.permission_denials ?? [])
		.map(({ tool_name: tool, tool_input: input = {} }) => {
			const detail = String(input.command ?? input.file_path ?? input.path ?? '')
				.replace(/\s+/g, ' ')
				.slice(0, 160);
			return `- \`${tool}\`${detail ? `: \`${detail.replaceAll('`', "'")}\`` : ''}`;
		})
		.join('\n');
}

const [command, arg, issue] = process.argv.slice(2);
if (command === 'header') console.log(COLUMNS.join(','));
else if (command === 'row') console.log(row(arg));
else if (command === 'summary') console.log(summary(arg, issue));
else if (command === 'denials') console.log(denials(arg));
else {
	console.error(
		'usage: costs.mjs header | row <execution-file> | summary <costs.csv> [issue] | denials <execution-file>',
	);
	process.exit(2);
}
