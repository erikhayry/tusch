import { browser } from '$app/environment';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY, type Model } from '$lib/types';
import { ConfigStateSchema, STORAGE, type ConfigState } from '$lib/utils/db/dbTypes';

function loadConfig(): ConfigState {
	if (!browser) return {};

	try {
		const stored = localStorage.getItem(STORAGE.CONFIG);
		if (stored) {
			const parsed = ConfigStateSchema.safeParse(JSON.parse(stored));
			if (parsed.success) return parsed.data;
			console.error('Failed to validate config from localStorage:', parsed.error);
		}
	} catch (err) {
		console.error('Failed to load config from localStorage:', err);
	}
	return {};
}

export const CONFIG_DB = $state<ConfigState>(loadConfig());

export function saveConfig(): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE.CONFIG, JSON.stringify(ConfigStateSchema.parse(CONFIG_DB)));
	} catch (err) {
		console.error('Failed to save config to localStorage:', err);
	}
}

export function getConfig(): ConfigState {
	return CONFIG_DB;
}

export function addTextModel(model: Model): ConfigState {
	const config = getConfig();

	config[TEXT_MODEL_KEY] = model;

	saveConfig();

	return getConfig();
}

export function getTextModel(): Model | undefined {
	return getConfig()[TEXT_MODEL_KEY];
}

export function addImageModel(model: Model): ConfigState {
	const config = getConfig();

	config[IMAGE_MODEL_KEY] = model;

	saveConfig();

	return getConfig();
}

export function getImageModel(): Model | undefined {
	return getConfig()[IMAGE_MODEL_KEY];
}
