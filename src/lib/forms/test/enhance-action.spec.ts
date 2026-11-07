import { globalError } from '$lib/utils/states/error.svelte';
import { globalLoading } from '$lib/utils/states/loading.svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enhanceAction } from '../enhance-action';

type Submitter = (input: { cancel: () => void; formData: FormData }) => unknown;
type AfterSubmit = (input: { result: unknown; update: () => Promise<void> }) => Promise<void>;

function submit(enhancer: unknown) {
	const cancel = vi.fn();
	const after = (enhancer as Submitter)({ cancel, formData: new FormData() }) as
		AfterSubmit | undefined;

	return { cancel, after };
}

describe('enhanceAction', () => {
	beforeEach(() => {
		globalError.reset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('starts and stops loading exactly once per submission', async () => {
		const start = vi.spyOn(globalLoading, 'start');
		const stop = vi.spyOn(globalLoading, 'stop');
		const { after } = submit(enhanceAction(vi.fn()));

		expect(start).toHaveBeenCalledOnce();
		expect(globalLoading.isLoading).toBe(true);

		await after?.({ result: { type: 'success', data: { id: '1' } }, update: vi.fn() });

		expect(stop).toHaveBeenCalledOnce();
		expect(globalLoading.isLoading).toBe(false);
	});

	it('passes the data and update to onSuccess', async () => {
		const onSuccess = vi.fn();
		const update = vi.fn();
		const { after } = submit(enhanceAction(onSuccess));

		await after?.({ result: { type: 'success', data: { id: '1' } }, update });

		expect(onSuccess).toHaveBeenCalledWith({ data: { id: '1' }, update });
	});

	it('does not call onSuccess for an action failure and shows its message', async () => {
		const onSuccess = vi.fn();
		const { after } = submit(enhanceAction(onSuccess));

		await after?.({
			result: { type: 'failure', status: 400, data: { code: 'invalid_input', message: 'Bad' } },
			update: vi.fn(),
		});

		expect(onSuccess).not.toHaveBeenCalled();
		expect(globalError.error).toEqual({ isError: true, message: 'Bad' });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('uses a generic message when a failure has no message', async () => {
		const { after } = submit(enhanceAction(vi.fn()));

		await after?.({ result: { type: 'failure', status: 400 }, update: vi.fn() });

		expect(globalError.error).toEqual({ isError: true, message: 'Submission failed' });
	});

	it('shows a server error message', async () => {
		const { after } = submit(enhanceAction(vi.fn()));

		await after?.({
			result: { type: 'error', error: new Error('AI request failed') },
			update: vi.fn(),
		});

		expect(globalError.error).toEqual({ isError: true, message: 'AI request failed' });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('surfaces a thrown success handler and stops loading without rethrowing', async () => {
		const { after } = submit(
			enhanceAction(() => {
				throw new Error('commit failed');
			}),
		);

		await expect(
			after?.({ result: { type: 'success', data: { id: '1' } }, update: vi.fn() }),
		).resolves.toBeUndefined();
		expect(globalError.error).toEqual({ isError: true, message: 'commit failed' });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('cancels a duplicate submission while the first is still in flight', async () => {
		const onSuccess = vi.fn();
		const enhancer = enhanceAction(onSuccess);
		const first = submit(enhancer);
		const duplicate = submit(enhancer);

		expect(duplicate.cancel).toHaveBeenCalledOnce();
		expect(duplicate.after).toBeUndefined();

		await first.after?.({ result: { type: 'success', data: { id: '1' } }, update: vi.fn() });
		expect(onSuccess).toHaveBeenCalledOnce();
	});

	it('accepts a new submission after the previous one finished', async () => {
		const onSuccess = vi.fn();
		const enhancer = enhanceAction(onSuccess);
		const first = submit(enhancer);
		await first.after?.({ result: { type: 'success', data: { id: '1' } }, update: vi.fn() });

		const second = submit(enhancer);
		await second.after?.({ result: { type: 'success', data: { id: '2' } }, update: vi.fn() });

		expect(second.cancel).not.toHaveBeenCalled();
		expect(onSuccess).toHaveBeenCalledTimes(2);
	});

	it('keeps the loader visible while another form is still submitting', async () => {
		const first = submit(enhanceAction(vi.fn()));
		const second = submit(enhanceAction(vi.fn()));

		await first.after?.({ result: { type: 'success' }, update: vi.fn() });
		expect(globalLoading.isLoading).toBe(true);

		await second.after?.({ result: { type: 'success' }, update: vi.fn() });
		expect(globalLoading.isLoading).toBe(false);
	});
});
