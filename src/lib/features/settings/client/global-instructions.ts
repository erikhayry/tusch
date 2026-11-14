import { browser } from '$app/environment';
import type { SubmitFunction } from '@sveltejs/kit';
import {
	GLOBAL_INSTRUCTIONS_MAX_LENGTH,
	GLOBAL_INSTRUCTIONS_VALUE_KEY,
	type SaveGlobalInstructionsValues,
} from '../contracts/globalInstructions';

const STORAGE_KEY = 'global_instructions';

/** Corrupt, missing or too-long stored values read as empty. */
export function readGlobalInstructions(): string {
	if (!browser) return '';
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		return value !== null && value.length <= GLOBAL_INSTRUCTIONS_MAX_LENGTH ? value : '';
	} catch {
		return '';
	}
}

/** Client command for the settings form; an empty value clears the key. */
export function saveGlobalInstructions(values: SaveGlobalInstructionsValues): void {
	const text = values[GLOBAL_INSTRUCTIONS_VALUE_KEY];
	if (text === '') localStorage.removeItem(STORAGE_KEY);
	else localStorage.setItem(STORAGE_KEY, text);
}

/**
 * Wrap a generation form's submit handler so the hidden field is filled when the
 * user submits, not when the form renders: a value saved in another tab still counts.
 */
export function withGlobalInstructions<T extends Record<string, unknown>>(
	submit: SubmitFunction<T>,
): SubmitFunction<T> {
	return (input) => {
		input.formData.set(GLOBAL_INSTRUCTIONS_VALUE_KEY, readGlobalInstructions());
		return submit(input);
	};
}
