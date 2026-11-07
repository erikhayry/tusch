import { globalError } from '$lib/utils/states/error.svelte';
import { globalLoading } from '$lib/utils/states/loading.svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { enhanceClientCommand } from '../enhance-client-command';

const ValueSchema = z.object({ value: z.string() });
type Value = z.infer<typeof ValueSchema>;

type Submitter = (input: { cancel: () => void; formData: FormData }) => unknown;
type AfterSubmit = (input: { result: unknown; update: () => Promise<void> }) => Promise<void>;

function decode(formData: FormData) {
	return ValueSchema.safeParse({ value: formData.get('value') });
}

function submit(enhancer: unknown, value: string | null = 'edited') {
	const cancel = vi.fn();
	const formData = new FormData();
	if (value !== null) formData.set('value', value);

	const after = (enhancer as Submitter)({ cancel, formData }) as AfterSubmit | undefined;
	return { cancel, after };
}

const SUCCESS = { type: 'success', data: { success: true } } as const;

describe('enhanceClientCommand', () => {
	beforeEach(() => {
		globalError.reset();
	});

	it('does not run the command and cancels when decoding fails', () => {
		const command = vi.fn();
		const { cancel, after } = submit(enhanceClientCommand(decode, command), null);

		expect(cancel).toHaveBeenCalledOnce();
		expect(after).toBeUndefined();
		expect(command).not.toHaveBeenCalled();
		expect(globalError.error.isError).toBe(true);
		expect(globalLoading.isLoading).toBe(false);
	});

	it('runs the command once with the decoded value after the action succeeds', async () => {
		const command = vi.fn<(value: Value) => void>();
		const onSuccess = vi.fn();
		const update = vi.fn();
		const { after } = submit(enhanceClientCommand(decode, command, onSuccess));

		expect(command).not.toHaveBeenCalled();
		await after?.({ result: SUCCESS, update });

		expect(command).toHaveBeenCalledOnce();
		expect(command).toHaveBeenCalledWith({ value: 'edited' });
		expect(onSuccess).toHaveBeenCalledWith({ update });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('does not run the command when the action fails', async () => {
		const command = vi.fn();
		const { after } = submit(enhanceClientCommand(decode, command));

		await after?.({
			result: { type: 'failure', status: 400, data: { message: 'Nope' } },
			update: vi.fn(),
		});

		expect(command).not.toHaveBeenCalled();
		expect(globalError.error).toEqual({ isError: true, message: 'Nope' });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('does not run the command when the action errors', async () => {
		const command = vi.fn();
		const { after } = submit(enhanceClientCommand(decode, command));

		await after?.({
			result: { type: 'error', error: new Error('network down') },
			update: vi.fn(),
		});

		expect(command).not.toHaveBeenCalled();
		expect(globalError.error).toEqual({ isError: true, message: 'network down' });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('surfaces a thrown command and stops loading', async () => {
		const { after } = submit(
			enhanceClientCommand(decode, () => {
				throw new Error('store write failed');
			}),
		);

		await expect(after?.({ result: SUCCESS, update: vi.fn() })).resolves.toBeUndefined();
		expect(globalError.error).toEqual({ isError: true, message: 'store write failed' });
		expect(globalLoading.isLoading).toBe(false);
	});

	it('cancels a duplicate submission so the command cannot run twice', async () => {
		const command = vi.fn();
		const enhancer = enhanceClientCommand(decode, command);
		const first = submit(enhancer);
		const duplicate = submit(enhancer);

		expect(duplicate.cancel).toHaveBeenCalledOnce();

		await first.after?.({ result: SUCCESS, update: vi.fn() });
		expect(command).toHaveBeenCalledOnce();
	});
});
