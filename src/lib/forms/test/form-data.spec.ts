import { describe, expect, it } from 'vitest';
import {
	encodeFormValue,
	readCheckbox,
	readInteger,
	readJsonField,
	readString,
} from '../form-data';

function formDataOf(entries: Record<string, string>) {
	const formData = new FormData();
	Object.entries(entries).forEach(([key, value]) => formData.set(key, value));
	return formData;
}

describe('form-data', () => {
	describe('readString', () => {
		it.each(['123', 'false', 'null', '[1,2]', '{"a":1}', 'hello'])(
			'keeps text "%s" unchanged',
			(text) => {
				expect(readString(formDataOf({ field: text }), 'field')).toBe(text);
			},
		);

		it('returns undefined when the field is missing', () => {
			expect(readString(new FormData(), 'field')).toBeUndefined();
		});
	});

	describe('readCheckbox', () => {
		it('returns true for a checked native checkbox, which submits "on"', () => {
			expect(readCheckbox(formDataOf({ includeImage: 'on' }), 'includeImage')).toBe(true);
		});

		it('returns false when the checkbox is absent', () => {
			expect(readCheckbox(new FormData(), 'includeImage')).toBe(false);
		});
	});

	describe('readInteger', () => {
		it('converts integer text to a number', () => {
			expect(readInteger(formDataOf({ index: '3' }), 'index')).toBe(3);
		});

		it('converts negative integer text to a number', () => {
			expect(readInteger(formDataOf({ index: '-1' }), 'index')).toBe(-1);
		});

		it.each(['3.5', 'abc', ''])('leaves non-integer text "%s" for schema rejection', (text) => {
			expect(readInteger(formDataOf({ index: text }), 'index')).toBe(text);
		});

		it('returns undefined when the field is missing', () => {
			expect(readInteger(new FormData(), 'index')).toBeUndefined();
		});
	});

	describe('readJsonField', () => {
		it('parses a declared JSON field', () => {
			expect(readJsonField(formDataOf({ panels: '[{"id":"a"}]' }), 'panels')).toEqual([
				{ id: 'a' },
			]);
		});

		it('returns the raw text for a malformed JSON field so the schema rejects it', () => {
			expect(readJsonField(formDataOf({ panels: '[not json' }), 'panels')).toBe('[not json');
		});

		it('returns undefined when the field is missing', () => {
			expect(readJsonField(new FormData(), 'panels')).toBeUndefined();
		});
	});

	describe('encodeFormValue', () => {
		it('writes strings raw so they are not wrapped in quotes', () => {
			expect(encodeFormValue('abc')).toBe('abc');
		});

		it('writes non-string values as JSON', () => {
			expect(encodeFormValue(3)).toBe('3');
			expect(encodeFormValue([{ id: 'a' }])).toBe('[{"id":"a"}]');
		});

		it('round-trips string fields through readString without JSON coercion', () => {
			const formData = formDataOf({ instructions: encodeFormValue('123') });
			expect(readString(formData, 'instructions')).toBe('123');
		});
	});
});
