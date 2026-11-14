#!/usr/bin/env node
// Test-only Sentry ingest stub for E2E (REQ-185-3). The second preview server in
// playwright.config.ts points its DSN here, so the real Sentry client runs and
// the tests can read what it would have sent.
//
//   POST /api/<id>/envelope/  stores the events inside the envelope
//   GET  /events              returns the stored events as JSON
//   DELETE /events            forgets them
import { createServer } from 'node:http';
import { gunzipSync } from 'node:zlib';

const port = Number(process.argv[2] ?? 4174);
const events = [];

// An envelope is newline-delimited JSON: a header, then (item header, payload) pairs.
function eventsIn(envelope) {
	const lines = envelope.split('\n');
	const found = [];
	for (let index = 1; index < lines.length - 1; index += 2) {
		try {
			if (JSON.parse(lines[index]).type === 'event') found.push(JSON.parse(lines[index + 1]));
		} catch {
			// Attachments and other binary items aren't events.
		}
	}
	return found;
}

createServer((request, response) => {
	if (request.url === '/events' && request.method === 'GET') {
		response.setHeader('content-type', 'application/json');
		response.end(JSON.stringify(events));
		return;
	}
	if (request.url === '/events' && request.method === 'DELETE') {
		events.length = 0;
		response.statusCode = 204;
		response.end();
		return;
	}
	if (request.method === 'POST' && request.url?.includes('/envelope')) {
		const chunks = [];
		request.on('data', (chunk) => chunks.push(chunk));
		request.on('end', () => {
			const body = Buffer.concat(chunks);
			const text = request.headers['content-encoding'] === 'gzip' ? gunzipSync(body) : body;
			events.push(...eventsIn(text.toString('utf8')));
			response.setHeader('content-type', 'application/json');
			response.end('{}');
		});
		return;
	}
	response.statusCode = 404;
	response.end();
}).listen(port);
