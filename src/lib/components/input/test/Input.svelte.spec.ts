import { renderInput } from '$lib/components/input/test/utils/renderInput';
import { describe, expect, it } from 'vitest';

describe('Input', () => {
	it('should render name', () => {
		const { getName } = renderInput();

		expect(getName()).toBeInTheDocument();
	});
});
