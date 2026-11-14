import type { Comic } from '$lib/types';
import { exampleCharacter, exampleCover, examplePanelImage } from './example-helpers';

// The mock gateway's default crops point at these ids (openAiResponse.ts).
const MARA = 'aaaaaaaa-0000-4000-8000-0000000000c1';
const TOBIAS = 'aaaaaaaa-0000-4000-8000-0000000000c2';

// Complete shape: cover, two characters with crops, three panels with images.
export const EXAMPLE_COMPLETE: Comic = {
	id: 'aaaaaaaa-0000-4000-8000-000000000001',
	style: 'anime',
	source: 'https://example.com/lighthouse-keepers',
	title: 'Example: The Lighthouse Keepers',
	cover: exampleCover('cover-a', 'A flat dark slate cover labelled "Comic A · cover".'),
	characters: [
		exampleCharacter(MARA, 'Mara', 'yellow raincoat'),
		exampleCharacter(TOBIAS, 'Tobias', 'grey wool sweater'),
	],
	panels: [
		{
			id: 'aaaaaaaa-0000-4000-8000-0000000000a1',
			editorialTitle: 'The storm arrives',
			captions: ['A storm rolls in over the island.'],
			dialogue: [
				{ characterId: MARA, text: 'Light the lamp, Tobias.' },
				{ characterId: TOBIAS, text: 'It is already burning.' },
			],
			visualDescription: 'Mara and Tobias stand in the lamp room as dark clouds gather outside.',
			place: 'Lighthouse lamp room',
			season: 'autumn',
			timeOfDay: 'dusk',
			year: 1952,
			image: examplePanelImage('a1', 'A flat blue panel labelled "A · panel 1".', {
				landscape: [
					{
						id: MARA,
						head: { x: 100, y: 80, width: 90, height: 100 },
						full: { x: 60, y: 80, width: 200, height: 400 },
					},
					{
						id: TOBIAS,
						head: { x: 450, y: 90, width: 90, height: 100 },
						full: { x: 410, y: 90, width: 200, height: 400 },
					},
				],
				portrait: [
					{
						id: MARA,
						head: { x: 60, y: 100, width: 80, height: 90 },
						full: { x: 30, y: 100, width: 180, height: 600 },
					},
					{
						id: TOBIAS,
						head: { x: 300, y: 150, width: 80, height: 90 },
						full: { x: 270, y: 150, width: 180, height: 600 },
					},
				],
			}),
		},
		{
			id: 'aaaaaaaa-0000-4000-8000-0000000000a2',
			editorialTitle: 'The long climb',
			captions: ['Mara climbs the stairs to check the glass.'],
			dialogue: [{ characterId: MARA, text: 'The wind is shaking the whole tower.' }],
			visualDescription: 'Mara climbs the spiral staircase with a lantern in her hand.',
			place: 'Lighthouse stairs',
			season: 'autumn',
			timeOfDay: 'night',
			year: 1952,
			image: examplePanelImage('a2', 'A flat light blue panel labelled "A · panel 2".', {
				landscape: [
					{
						id: MARA,
						head: { x: 200, y: 60, width: 100, height: 110 },
						full: { x: 160, y: 60, width: 220, height: 420 },
					},
				],
				portrait: [
					{
						id: MARA,
						head: { x: 150, y: 80, width: 90, height: 100 },
						full: { x: 110, y: 80, width: 200, height: 640 },
					},
				],
			}),
		},
		{
			id: 'aaaaaaaa-0000-4000-8000-0000000000a3',
			editorialTitle: 'Morning calm',
			captions: ['By morning the sea is calm again.', 'The ships sail past safely.'],
			dialogue: [{ characterId: TOBIAS, text: 'Not a single ship lost.' }],
			visualDescription: 'Tobias leans on the balcony railing and watches the calm sea.',
			place: 'Lighthouse balcony',
			season: 'autumn',
			timeOfDay: 'morning',
			year: 1952,
			image: examplePanelImage('a3', 'A flat green panel labelled "A · panel 3".', {
				landscape: [
					{
						id: TOBIAS,
						head: { x: 300, y: 70, width: 100, height: 110 },
						full: { x: 260, y: 70, width: 220, height: 420 },
					},
				],
				portrait: [
					{
						id: TOBIAS,
						head: { x: 200, y: 90, width: 90, height: 100 },
						full: { x: 160, y: 90, width: 200, height: 640 },
					},
				],
			}),
		},
	],
};
