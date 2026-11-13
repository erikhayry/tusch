import type { Comic } from '$lib/types';
import { EXAMPLES } from '../../examples/examples';

/**
 * The seeded examples by shape (REQ-004): A is complete (cover, images, two
 * characters with crops), B has no cover and no panel images, C is minimal
 * (one panel). Views and tests that need "the" example use A.
 */
function exampleAt(index: number): Comic {
	const example = EXAMPLES[index];
	if (!example) {
		throw new Error(`EXAMPLES must hold 3 comics (A, B, C); index ${index} is missing`);
	}
	return example;
}

export const EXAMPLE_COMPLETE = exampleAt(0);
export const exampleNoImages = () => exampleAt(1);
export const exampleMinimal = () => exampleAt(2);
export const exampleTitles = () => [0, 1, 2].map((index) => exampleAt(index).title);
