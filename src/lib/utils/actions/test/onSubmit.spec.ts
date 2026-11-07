import { beforeEach, describe, expect, it, vi } from 'vitest';
import { globalError } from '../../states/error.svelte';
import { globalLoading } from '../../states/loading.svelte';
import { onSubmit } from '../onSubmit';

type SubmitResult = { result: unknown; update: () => Promise<void> };
type AfterSubmit = (parameters: SubmitResult) => Promise<void>;

async function startSubmit(onSuccess: Parameters<typeof onSubmit>[0]): Promise<AfterSubmit> {
	const submit = onSubmit(onSuccess) as unknown as () => Promise<AfterSubmit>;
	return submit();
}

describe('onSubmit', () => {
	beforeEach(() => {
		globalError.reset();
		globalLoading.stop();
	});

	it('starts loading when the submission starts and stops it after the result', async () => {
		const afterSubmit = await startSubmit(vi.fn());
		expect(globalLoading.isLoading).toBe(true);

		await afterSubmit({ result: { type: 'success', data: undefined }, update: vi.fn() });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('calls onSuccess with the result on a successful action', async () => {
		const onSuccess = vi.fn();
		const update = vi.fn();
		const result = { type: 'success', data: { id: '1' } };
		const afterSubmit = await startSubmit(onSuccess);

		await afterSubmit({ result, update });

		expect(onSuccess).toHaveBeenCalledOnce();
		expect(onSuccess).toHaveBeenCalledWith({ update, result });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('does not call onSuccess when a successful action returns no data', async () => {
		const onSuccess = vi.fn();
		const afterSubmit = await startSubmit(onSuccess);

		await afterSubmit({ result: { type: 'success', data: undefined }, update: vi.fn() });

		expect(onSuccess).not.toHaveBeenCalled();
		expect(globalLoading.isLoading).toBe(false);
	});

	it('sets the failure message from an expected action failure', async () => {
		const onSuccess = vi.fn();
		const afterSubmit = await startSubmit(onSuccess);

		await afterSubmit({
			result: { type: 'failure', status: 400, data: { message: 'Submitted values are invalid' } },
			update: vi.fn(),
		});

		expect(onSuccess).not.toHaveBeenCalled();
		expect(globalError.error).toEqual({ isError: true, message: 'Submitted values are invalid' });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('uses a generic message when a failure has no message', async () => {
		const afterSubmit = await startSubmit(vi.fn());

		await afterSubmit({
			result: { type: 'failure', status: 400, data: { code: 'x' } },
			update: vi.fn(),
		});

		expect(globalError.error).toEqual({ isError: true, message: 'Submission failed' });
	});

	it('sets the message from a server error', async () => {
		const afterSubmit = await startSubmit(vi.fn());

		await afterSubmit({
			result: { type: 'error', error: new Error('AI request failed') },
			update: vi.fn(),
		});

		expect(globalError.error).toEqual({ isError: true, message: 'AI request failed' });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('stops loading and rethrows when the success callback throws', async () => {
		const afterSubmit = await startSubmit(() => {
			throw new Error('commit failed');
		});

		await expect(
			afterSubmit({ result: { type: 'success', data: { id: '1' } }, update: vi.fn() }),
		).rejects.toThrow('commit failed');
		expect(globalLoading.isLoading).toBe(false);
	});
});
