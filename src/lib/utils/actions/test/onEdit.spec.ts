import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { globalError } from '../../states/error.svelte';
import { globalLoading } from '../../states/loading.svelte';
import { onEdit } from '../onEdit';

const ValueSchema = z.object({ value: z.string() });
type Value = z.infer<typeof ValueSchema>;

type AfterSubmit = (parameters: { update: () => Promise<void>; result: unknown }) => Promise<void>;

function getValues(formData: FormData) {
	return ValueSchema.safeParse({ value: formData.get('value') });
}

async function startSubmit(
	updateType: (data: Value) => void,
	onSuccess?: Parameters<typeof onEdit<Value>>[2],
	formData = new FormData(),
): Promise<AfterSubmit> {
	const submit = onEdit<Value>(getValues, updateType, onSuccess) as unknown as (input: {
		formData: FormData;
	}) => Promise<AfterSubmit>;
	return submit({ formData });
}

describe('onEdit', () => {
	beforeEach(() => {
		globalError.reset();
		globalLoading.stop();
	});

	it('applies valid values and calls update when there is no success callback', async () => {
		const formData = new FormData();
		formData.set('value', 'edited');
		const updateType = vi.fn();
		const update = vi.fn();

		const afterSubmit = await startSubmit(updateType, undefined, formData);
		await afterSubmit({ update, result: { type: 'success' } });

		expect(updateType).toHaveBeenCalledWith({ value: 'edited' });
		expect(update).toHaveBeenCalledOnce();
		expect(globalLoading.isLoading).toBe(false);
	});

	it('does not apply invalid values and reports the validation error', async () => {
		const updateType = vi.fn();
		const update = vi.fn();

		const afterSubmit = await startSubmit(updateType);
		await afterSubmit({ update, result: { type: 'success' } });

		expect(updateType).not.toHaveBeenCalled();
		expect(update).toHaveBeenCalledOnce();
		expect(globalError.error.isError).toBe(true);
		expect(globalLoading.isLoading).toBe(false);
	});

	it('runs the success callback instead of update for valid values', async () => {
		const onSuccess = vi.fn();
		const update = vi.fn();
		const formData = new FormData();
		formData.set('value', 'edited');

		const afterSubmit = await startSubmit(vi.fn(), onSuccess, formData);
		await afterSubmit({ update, result: { type: 'success' } });

		expect(onSuccess).toHaveBeenCalledOnce();
		expect(update).not.toHaveBeenCalled();
	});

	it('falls back to update instead of the success callback for invalid values', async () => {
		const onSuccess = vi.fn();
		const update = vi.fn();

		const afterSubmit = await startSubmit(vi.fn(), onSuccess);
		await afterSubmit({ update, result: { type: 'success' } });

		expect(onSuccess).not.toHaveBeenCalled();
		expect(update).toHaveBeenCalledOnce();
	});

	it('stops loading and rethrows when update fails', async () => {
		const afterSubmit = await startSubmit(vi.fn());

		await expect(
			afterSubmit({
				update: () => Promise.reject(new Error('update failed')),
				result: { type: 'success' },
			}),
		).rejects.toThrow('update failed');
		expect(globalLoading.isLoading).toBe(false);
	});

	it('applies the mutation before the submission result is known', async () => {
		// Characterization of current behavior: the client mutation runs during submit,
		// before the no-op action result arrives. WP2 changes this to commit after success.
		const formData = new FormData();
		formData.set('value', 'edited');
		const updateType = vi.fn();

		await startSubmit(updateType, undefined, formData);

		expect(updateType).toHaveBeenCalledOnce();
	});
});
