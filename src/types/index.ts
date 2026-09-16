export interface ImageAsset {
  src: string;
  width: number;
  height: number;
}

export interface ResponsiveImage {
  wide: ImageAsset;
  narrow: ImageAsset;
  alt: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  images: string[];
}

export interface ComicSetting {
  years: number[];
  seasons: string[];
  places: string[];
  timeOfDays: string[]
}

export interface Dialogue {
  characterId: string;
  text: string;
}

export interface ScriptPanel {
  captions: string[];
  dialogue: Dialogue[];
  year: number;
  season: string;
  place: string;
  timeOfDay: string;
}

export interface ComicScript {
  source: string;
  setting: ComicSetting;
  characters: Character[];
  panels: ScriptPanel[];
}

export interface ComicPanel {
  image: ResponsiveImage;
  captions: string[];
  dialogue: Dialogue[];
}

export interface Comic {
  id: string;
  title: string;
  script: ComicScript;
  panels: ComicPanel[];
}
