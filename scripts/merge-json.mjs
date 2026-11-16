// Git merge driver for flat JSON maps (messages/*.json): a three-way merge per
// key. Two branches that each add a message used to conflict, because both append
// to the end of the same file. scripts/merge-main.sh registers it.
//
//   node scripts/merge-json.mjs <base> <ours> <theirs>     (git's %O %A %B)
//
// Writes the result to <ours> and exits 0. Exits 1, leaving <ours> untouched, when
// a file isn't a JSON object or both sides changed the same key differently; git
// then reports the file as conflicting.
import { readFileSync, writeFileSync } from 'node:fs';

function read(path) {
	const text = readFileSync(path, 'utf8').trim();
	// git passes an empty base when both sides added the file.
	const value = text === '' ? {} : JSON.parse(text);
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new TypeError(`${path} is not a JSON object`);
	}
	return value;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function merge(base, ours, theirs) {
	const result = {};
	// Our order first, then the keys only they have: additions stay at the end.
	for (const key of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
		let value;
		if (same(ours[key], theirs[key]) || same(theirs[key], base[key])) {
			value = ours[key];
		} else if (same(ours[key], base[key])) {
			value = theirs[key];
		} else {
			throw new Error(`both sides changed "${key}"`);
		}
		if (value !== undefined) {
			result[key] = value;
		}
	}
	return result;
}

const [basePath, oursPath, theirsPath] = process.argv.slice(2);
try {
	const merged = merge(read(basePath), read(oursPath), read(theirsPath));
	// Tabs and a final newline: what Prettier writes for these files.
	writeFileSync(oursPath, `${JSON.stringify(merged, null, '\t')}\n`);
} catch (error) {
	console.error(`merge-json: ${error.message}`);
	process.exit(1);
}
