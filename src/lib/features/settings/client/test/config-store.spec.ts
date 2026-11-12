import { describe, expect, it } from 'vitest';
import { addImageModel, addTextModel, getImageModel, getTextModel } from '../config-store.svelte';

describe('config store', () => {
	it('stores the selected text and image models', () => {
		addTextModel('text-model');
		addImageModel('image-model');

		expect(getTextModel()).toBe('text-model');
		expect(getImageModel()).toBe('image-model');
	});
});
