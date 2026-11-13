import { z } from 'zod';

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

export type WebVitalsOptions = {
	/** Views to audit, keyed by `VIEWS` name. */
	views: string[];
	/** Lighthouse runs per view; the median is compared with the budget. */
	runs: number;
	/** Overrides the default budget (LCP 2500 ms, CLS 0.1, TBT 200 ms). */
	budget?: WebVitalsBudget;
};

/**
 * Audits the views on the preview server (port 4173) with Lighthouse
 * (`@lhci/cli`, desktop preset) and returns every metric whose median exceeds
 * its budget. Implemented by the developer for issue #81.
 */
export async function checkWebVitals(options: WebVitalsOptions): Promise<WebVitalsViolation[]> {
	void options;
	throw new Error('checkWebVitals is not implemented (issue #81)');
}
