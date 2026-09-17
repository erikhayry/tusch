import { renderCharachter } from '$lib/components/panel/components/charachter/test/utils/renderCharacter';
import { describe, expect, it } from 'vitest';

describe('Character', () => {
	it('should render name', () => {
		const { getName } = renderCharachter();

		expect(getName()).toBeInTheDocument();
	});
});
