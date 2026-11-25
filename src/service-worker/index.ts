/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { version } from '$app/env';
import { self } from '$app/service-worker';
import { assets, immutable } from '$app/manifest';
import { resolve } from '$app/paths';

// One cache per build: `version` changes on every deploy, and activate deletes the rest.
const CACHE = `tusch-${version}`;
// Every route under (local) is ssr = false, so one shell serves all of them: the client
// router reads the URL itself once the shell has loaded.
const SHELL = resolve('/');
// `immutable` and `assets` are relative to the base path; the fetch handler matches
// `url.pathname`, so resolve them to absolute paths.
const PRECACHE = [
	SHELL,
	...immutable.map((file) => resolve(file.path)),
	...assets.map((file) => resolve(file.path)),
];
const PRECACHE_PATHS = new Set<string>(PRECACHE);
// Pages rendered on the server, and the API, must reach the network: the AI key and
// results are never cached, and a mocked navigation (`page.route`) must still apply.
const SERVER_RENDERED = /\/(settings|api)(\/|$)/;
const DATA_SUFFIX = '/__data.json';

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			// Take over without waiting for every tab to close: the next load runs the new build.
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	// Only GET is cached. Anything not answered here goes to the network untouched:
	// no respondWith, so the browser (and Playwright's page.route) handles it as usual.
	if (request.method !== 'GET') {
		return;
	}
	const url = new URL(request.url);
	if (url.origin !== self.location.origin) {
		return;
	}

	if (request.mode === 'navigate') {
		if (SERVER_RENDERED.test(url.pathname)) {
			return;
		}
		event.respondWith(networkThenShell(request));
		return;
	}

	// SvelteKit fetches a page's server data (the `hasKey` flag of `/`) as `__data.json` when
	// the page loads. It is the one per-page request the offline shell still needs, so the
	// last online copy is the fallback. It holds the flag only; the key is never in it (REQ-029).
	if (url.pathname.endsWith(DATA_SUFFIX) && !SERVER_RENDERED.test(url.pathname)) {
		event.respondWith(networkThenCache(request));
		return;
	}

	if (PRECACHE_PATHS.has(url.pathname)) {
		event.respondWith(cacheFirst(request));
	}
});

async function networkThenShell(request: Request): Promise<Response> {
	try {
		return await fetch(request);
	} catch {
		const cache = await caches.open(CACHE);
		const shell = await cache.match(SHELL);
		return shell ?? Response.error();
	}
}

async function networkThenCache(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE);
	try {
		const response = await fetch(request);
		if (response.ok) {
			void cache.put(request, response.clone());
		}
		return response;
	} catch {
		return (await cache.match(request)) ?? Response.error();
	}
}

async function cacheFirst(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE);
	// Matched by pathname: a preload request's headers (e.g. Vary) would otherwise miss the
	// copy stored at install, and the offline fetch then fails.
	const cached = await cache.match(new URL(request.url).pathname);
	return cached ?? fetch(request);
}
