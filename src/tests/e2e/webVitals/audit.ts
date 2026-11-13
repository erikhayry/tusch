import { execFile } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { chromium } from '@playwright/test';
import { z } from 'zod';
import { VIEWS } from '../views';
import { DEFAULT_BUDGET, VIEW_BUDGET_OVERRIDES } from './budget';

const run = promisify(execFile);

const BASE_URL = 'http://localhost:4173';
const LHCI_BIN = join(process.cwd(), 'node_modules', '.bin', 'lhci');

export const WebVitalMetricSchema = z.enum(['lcp', 'cls', 'tbt']);
export const WebVitalsBudgetSchema = z.partialRecord(WebVitalMetricSchema, z.number());
export const WebVitalsViolationSchema = z.object({
	view: z.string(),
	metric: WebVitalMetricSchema,
	value: z.number(),
	limit: z.number(),
});

export type WebVitalsBudget = z.infer<typeof WebVitalsBudgetSchema>;
export type WebVitalsViolation = z.infer<typeof WebVitalsViolationSchema>;
type WebVitalMetric = z.infer<typeof WebVitalMetricSchema>;

export type WebVitalsOptions = {
	/** Views to audit, keyed by `VIEWS` name. */
	views: (keyof typeof VIEWS)[];
	/** Lighthouse runs per view; the median is compared with the budget. */
	runs: number;
	/** Overrides single limits of the default budget (see `budget.ts`). */
	budget?: WebVitalsBudget;
};

// Only the audits we read from a Lighthouse result.
const AUDIT_IDS: Record<WebVitalMetric, string> = {
	lcp: 'largest-contentful-paint',
	cls: 'cumulative-layout-shift',
	tbt: 'total-blocking-time',
};

const LighthouseResultSchema = z.object({
	audits: z.record(z.string(), z.object({ numericValue: z.number().optional() })),
});

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function auditView(
	view: keyof typeof VIEWS,
	runs: number,
): Promise<Record<WebVitalMetric, number>> {
	// lhci writes its results to ./.lighthouseci in the working directory.
	const dir = await mkdtemp(join(tmpdir(), 'lhci-'));
	try {
		await run(
			LHCI_BIN,
			[
				'collect',
				`--url=${BASE_URL}${VIEWS[view]}`,
				`--numberOfRuns=${runs}`,
				'--settings.preset=desktop',
				// The CI container runs as root, where Chromium refuses to start sandboxed.
				// /dev/shm is tiny in containers; without this Chromium can stall before first paint.
				'--settings.chromeFlags=--no-sandbox --headless=new --disable-dev-shm-usage --disable-gpu',
			],
			{ cwd: dir, env: { ...process.env, CHROME_PATH: chromium.executablePath() } },
		);
		const outDir = join(dir, '.lighthouseci');
		const files = (await readdir(outDir)).filter((f) => /^lhr-.*\.json$/.test(f));
		if (files.length !== runs) {
			throw new Error(`Expected ${runs} Lighthouse results for ${view}, got ${files.length}`);
		}
		const results = await Promise.all(
			files.map(async (f) =>
				LighthouseResultSchema.parse(JSON.parse(await readFile(join(outDir, f), 'utf8'))),
			),
		);
		const value = (metric: WebVitalMetric) =>
			median(
				results.map((r) => {
					const numeric = r.audits[AUDIT_IDS[metric]]?.numericValue;
					if (numeric === undefined)
						throw new Error(`Lighthouse reported no ${metric} for ${view}`);
					return numeric;
				}),
			);
		return { lcp: value('lcp'), cls: value('cls'), tbt: value('tbt') };
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}

/**
 * Audits the views on the preview server (port 4173) with Lighthouse
 * (`@lhci/cli`, desktop preset) and returns every metric whose median exceeds
 * its budget. Views run one after another: parallel audits skew each other.
 */
export async function checkWebVitals(options: WebVitalsOptions): Promise<WebVitalsViolation[]> {
	const violations: WebVitalsViolation[] = [];
	for (const view of options.views) {
		// An explicit budget wins over the per-view overrides, so tests can force a failure.
		const budget = { ...DEFAULT_BUDGET, ...VIEW_BUDGET_OVERRIDES[view], ...options.budget };
		const medians = await auditView(view, options.runs);
		for (const metric of WebVitalMetricSchema.options) {
			if (medians[metric] > budget[metric]) {
				violations.push({ view, metric, value: medians[metric], limit: budget[metric] });
			}
		}
	}
	return violations;
}
