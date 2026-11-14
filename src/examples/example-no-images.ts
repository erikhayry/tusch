import type { Comic } from '$lib/types';
import { exampleCharacter } from './example-helpers';

const NORA = 'bbbbbbbb-0000-4000-8000-0000000000c1';

// No cover and no panel images: the shape a freshly created comic has before
// any image is generated.
export const EXAMPLE_NO_IMAGES: Comic = {
	id: 'bbbbbbbb-0000-4000-8000-000000000001',
	style: 'classic-marvel',
	source: 'https://example.com/letter-never-sent',
	title: 'Example: A Letter Never Sent',
	characters: [exampleCharacter(NORA, 'Nora', 'green cardigan')],
	panels: [
		{
			id: 'bbbbbbbb-0000-4000-8000-0000000000b1',
			editorialTitle: 'The empty desk',
			captions: ['Nora sits down to write a letter.', 'She has been putting it off for years.'],
			dialogue: [{ characterId: NORA, text: 'Dear Anna, where do I even begin?' }],
			visualDescription: 'Nora sits at a wooden desk with a blank sheet of paper in front of her.',
			place: 'Nora’s study',
			season: 'winter',
			timeOfDay: 'night',
			year: 1987,
		},
		{
			id: 'bbbbbbbb-0000-4000-8000-0000000000b2',
			editorialTitle: 'The unsent letter',
			captions: ['In the end the letter stays in the drawer.'],
			dialogue: [{ characterId: NORA, text: 'Maybe tomorrow.' }],
			visualDescription: 'Nora folds the letter and puts it in a drawer full of old envelopes.',
			place: 'Nora’s study',
			season: 'winter',
			timeOfDay: 'night',
			year: 1987,
		},
	],
};
