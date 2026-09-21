import { renderCharachter } from '$lib/components/charachter/test/utils/renderCharacter';
import { describe, expect, it } from 'vitest';

describe('Character', () => {
	it('should render name', () => {
		const { getName } = renderCharachter();

		expect(getName()).toBeInTheDocument();
	});

	it('should render description', () => {
		const { getDescription } = renderCharachter();

		expect(getDescription()).toBeInTheDocument();
	});

	it('should render images', () => {
		const { getImages, props } = renderCharachter();

		expect(getImages()).toHaveLength(props.character.images.length);
	});
});
