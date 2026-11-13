import type { Comic } from '$lib/types';
import { exampleCharacter, exampleCover, examplePanelImage } from './example-helpers';

const OLIVER = 'cccccccc-0000-4000-8000-0000000000c1';

// Minimal shape: one character and one panel with one caption and one line.
export const EXAMPLE_MINIMAL: Comic = {
	id: 'cccccccc-0000-4000-8000-000000000001',
	style: 'franco-belgian',
	source: 'https://example.com/one-small-step',
	title: 'Example: One Small Step',
	cover: exampleCover('cover-c', 'A flat red cover labelled "Cover C".'),
	characters: [exampleCharacter(OLIVER, 'Oliver', 'white spacesuit')],
	panels: [
		{
			id: 'cccccccc-0000-4000-8000-0000000000d1',
			editorialTitle: 'The first step',
			captions: ['Oliver steps onto the surface.'],
			dialogue: [{ characterId: OLIVER, text: 'One small step.' }],
			visualDescription: 'Oliver puts his boot on grey dust under a black sky.',
			place: 'The Moon',
			season: 'summer',
			timeOfDay: 'noon',
			year: 1969,
			image: examplePanelImage('c1', 'A flat teal panel labelled "C1".'),
		},
	],
};
