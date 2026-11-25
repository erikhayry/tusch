import { m } from '#lib/paraglide/messages.js';

/** The create form's comic styles, in card order (REQ-306-1); the id is what a comic stores. */
export const COMIC_STYLES = () => [
	{ id: 'anime', name: m.styleAnime(), description: m.styleAnimeDescription() },
	{
		id: 'classic-marvel',
		name: m.styleClassicMarvel(),
		description: m.styleClassicMarvelDescription(),
	},
	{
		id: 'franco-belgian',
		name: m.styleFrancoBelgian(),
		description: m.styleFrancoBelgianDescription(),
	},
	{ id: 'manga', name: m.styleManga(), description: m.styleMangaDescription() },
	{ id: 'noir', name: m.styleNoir(), description: m.styleNoirDescription() },
	{
		id: 'newspaper-strip',
		name: m.styleNewspaperStrip(),
		description: m.styleNewspaperStripDescription(),
	},
	{
		id: 'watercolour',
		name: m.styleWatercolour(),
		description: m.styleWatercolourDescription(),
	},
	{ id: 'webtoon', name: m.styleWebtoon(), description: m.styleWebtoonDescription() },
	{ id: 'pop-art', name: m.stylePopArt(), description: m.stylePopArtDescription() },
	{ id: 'ukiyo-e', name: m.styleUkiyoE(), description: m.styleUkiyoEDescription() },
];

/** The style's name by id, as shown on a library card (REQ-295-1). */
export const styleName = (id: string) =>
	COMIC_STYLES().find((style) => style.id === id)?.name ?? id;
