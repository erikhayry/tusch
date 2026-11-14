#!/usr/bin/env node
// Agent bookkeeping (#50): one costs.csv row per agent run on GitHub.
//
//   node scripts/costs.mjs header
//   node scripts/costs.mjs row <execution-file>   context from env: ISSUE, SKILL,
//                                                 TARGET, CONCLUSION, RUN_URL
//   node scripts/costs.mjs summary <costs.csv> [issue]
//   node scripts/costs.mjs digest <execution-file>  compact, privacy-safe run digest (JSON);
//                                                   context from env as for `row`
//   node scripts/costs.mjs actions <digest-dir>     Markdown of repeated actions across digests
//
// `row` reads claude-code-action's execution file: a JSON array (or JSON lines)
// of SDK messages whose last `type: result` message carries cost, turns and
// usage. Missing fields stay empty rather than failing: bookkeeping must never
// block the pipeline. total_cost_usd is an API-price estimate, not what a
// subscription is billed.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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

// --- Digest (#84): what a run did, without what it said or read. ---------------
// Artifacts of this public repo are public, so only a command's first words, tool
// names and file paths survive; never arguments, prompts or tool output.

const WORD = /^[A-Za-z][\w.-]*$/;
const SUBCOMMAND_TOOLS = new Set(['gh', 'git', 'pnpm', 'node', 'npm', 'npx']);
const byName = ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0);

// First two words of a command, e.g. `pnpm run`. A second word that isn't a plain
// subcommand (a path, flag, quoted text) is dropped, as it may carry content.
function prefixOf(command) {
	const [first, second] = String(command ?? '')
		.trim()
		.split(/\s+/);
	if (!first || !/^[\w./-]+$/.test(first)) return '(other)';
	// Only these tools take a subcommand; after any other word (`echo sk-…`) the
	// second word may be a secret.
	return second && SUBCOMMAND_TOOLS.has(first) && WORD.test(second) ? `${first} ${second}` : first;
}

const sortedCounts = (counts) => Object.fromEntries([...counts].sort(byName));

function increment(counts, key) {
	counts.set(key, (counts.get(key) ?? 0) + 1);
}

function digest(file) {
	let messages = [];
	try {
		messages = parseMessages(readFileSync(file, 'utf8'));
	} catch {
		// No execution file: still emit a digest with empty counts.
	}
	const result = messages.findLast((message) => message?.type === 'result') ?? {};
	const init = messages.find((message) => message?.type === 'system' && message.subtype === 'init');
	const denials = Array.isArray(result.permission_denials) ? result.permission_denials : [];
	const denied = new Set(denials.map((d) => d.tool_use_id));
	const blocks = (type) =>
		messages
			.filter((message) => message?.type === type)
			.flatMap((message) => message.message?.content ?? [])
			.filter((block) => block && typeof block === 'object');

	const toolCalls = new Map();
	const bashPrefixes = new Map();
	const reads = new Map();
	const bashIds = new Map();
	const workspace = `${process.cwd()}/`;
	for (const block of blocks('assistant').filter((b) => b.type === 'tool_use')) {
		increment(toolCalls, block.name);
		if (block.name === 'Bash') {
			const prefix = prefixOf(block.input?.command);
			increment(bashPrefixes, prefix);
			bashIds.set(block.id, prefix);
		} else if (block.name === 'Read' && typeof block.input?.file_path === 'string') {
			increment(reads, block.input.file_path.replace(workspace, ''));
		}
	}

	const failedBash = new Map();
	for (const block of blocks('user').filter((b) => b.type === 'tool_result')) {
		if (block.is_error && bashIds.has(block.tool_use_id) && !denied.has(block.tool_use_id)) {
			increment(failedBash, bashIds.get(block.tool_use_id));
		}
	}

	const deniedCommands = new Map();
	for (const d of denials) {
		increment(
			deniedCommands,
			d.tool_name === 'Bash' ? prefixOf(d.tool_input?.command) : d.tool_name,
		);
	}

	const env = process.env;
	return `${JSON.stringify(
		{
			skill: env.SKILL ?? '',
			target: env.TARGET ?? '',
			conclusion: env.CONCLUSION ?? '',
			run_url: env.RUN_URL ?? '',
			model: Object.keys(result.modelUsage ?? {}).join('+') || init?.model || '',
			turns: result.num_turns ?? 0,
			cost_usd: typeof result.total_cost_usd === 'number' ? result.total_cost_usd : 0,
			permission_denials_count: denials.length,
			permission_denials: sortedCounts(deniedCommands),
			tool_calls: sortedCounts(toolCalls),
			bash_prefixes: sortedCounts(bashPrefixes),
			files_read_more_than_once: sortedCounts(new Map([...reads].filter(([, n]) => n > 1))),
			failed_bash: sortedCounts(failedBash),
		},
		null,
		2,
	)}\n`;
}

// --- Actions: aggregate digests for the weekly audit. ---------------------------

function readDigests(dir) {
	return readdirSync(dir, { recursive: true })
		.map(String)
		.filter((name) => name.endsWith('.json'))
		.sort()
		.flatMap((name) => {
			try {
				const parsed = JSON.parse(readFileSync(join(dir, name), 'utf8'));
				return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? [parsed] : [];
			} catch {
				return [];
			}
		});
}

// Rows of [key, { total, runs }], most total first, ties by name.
function ranked(digests, pick, minimum) {
	const totals = new Map();
	for (const d of digests) {
		for (const [key, n] of Object.entries(pick(d) ?? {})) {
			const t = totals.get(key) ?? { total: 0, runs: 0 };
			t.total += n;
			t.runs += 1;
			totals.set(key, t);
		}
	}
	return [...totals]
		.filter(([, t]) => t.total >= minimum)
		.sort((a, b) => b[1].total - a[1].total || byName(a, b))
		.slice(0, 10);
}

function markdownTable(headers, rows) {
	if (rows.length === 0) return 'None.\n';
	return [
		`| ${headers.join(' | ')} |`,
		`| --- | ${headers
			.slice(1)
			.map(() => '---:')
			.join(' | ')} |`,
		...rows.map((cells) => `| ${cells.map((c) => String(c).replaceAll('|', '\\|')).join(' | ')} |`),
		'',
	].join('\n');
}

function actions(dir) {
	const digests = readDigests(dir);
	if (digests.length === 0) return '# Agent actions\n\nNo digests.\n';

	const skills = new Map();
	for (const d of digests) {
		const name = d.skill || '(none)';
		const s = skills.get(name) ?? { runs: 0, turns: 0, cost: 0 };
		s.runs += 1;
		s.turns += Number(d.turns) || 0;
		s.cost += Number(d.cost_usd) || 0;
		skills.set(name, s);
	}
	const skillRows = [...skills]
		.sort(byName)
		.map(([name, s]) => [
			name,
			s.runs,
			(s.turns / s.runs).toFixed(1),
			`$${(s.cost / s.runs).toFixed(2)}`,
		]);

	const section = (title, headers, rows) => `## ${title}\n\n${markdownTable(headers, rows)}`;
	const counts = ([key, t]) => [key, t.total, t.runs];
	return [
		'# Agent actions',
		'',
		`${digests.length} run digests.`,
		'',
		section('Runs per skill', ['Skill', 'Runs', 'Avg turns', 'Avg cost'], skillRows),
		section(
			'Repeated Bash command prefixes',
			['Prefix', 'Calls', 'Runs'],
			ranked(digests, (d) => d.bash_prefixes, 2).map(counts),
		),
		section(
			'Denied commands',
			['Command', 'Denials', 'Runs'],
			ranked(digests, (d) => d.permission_denials, 1).map(counts),
		),
		section(
			'Files read more than once in a run',
			['File', 'Runs', 'Reads'],
			ranked(digests, (d) => d.files_read_more_than_once, 1).map(([key, t]) => [
				key,
				t.runs,
				t.total,
			]),
		),
		'## Runs',
		'',
		...digests.map((d) => `- ${d.skill} ${d.target} (${d.conclusion}): ${d.run_url}`),
		'',
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
else if (command === 'digest') process.stdout.write(digest(arg));
else if (command === 'actions') process.stdout.write(actions(arg));
else if (command === 'summary') console.log(summary(arg, issue));
else if (command === 'denials') console.log(denials(arg));
else {
	console.error(
		'usage: costs.mjs header | row <execution-file> | summary <costs.csv> [issue] | digest <execution-file> | actions <digest-dir> | denials <execution-file>',
	);
	process.exit(2);
}
