/**
 * The web vitals budget: one place to tune it. LCP and TBT are in
 * milliseconds, CLS is unitless.
 */
export const DEFAULT_BUDGET = { lcp: 2500, cls: 0.1, tbt: 200 } as const;

/**
 * Temporary per-view limits for views that miss the default budget today.
 * Each one is set above the measured median (with headroom for CI variance)
 * and must link the ticket that fixes the view; delete it when that lands.
 */
export const VIEW_BUDGET_OVERRIDES: Partial<
	Record<string, Partial<Record<keyof typeof DEFAULT_BUDGET, number>>>
> = {
	// Measured median 5.3 s. Remove when #149 is fixed.
	comic: { lcp: 7500 },
};
