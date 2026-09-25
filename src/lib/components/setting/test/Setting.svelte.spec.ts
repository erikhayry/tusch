import { describe, expect, it } from 'vitest';
import { renderSetting } from './utils/renderSetting';

describe('Setting', () => {
	it('renders years', () => {
		const { getYears, props } = renderSetting();

		expect(getYears()).toHaveLength(props.setting.years.length);
	});

	it('renders seasons', () => {
		const { getSeasons, props } = renderSetting();

		expect(getSeasons()).toHaveLength(props.setting.seasons.length);
	});

	it('renders locations', () => {
		const { getLocations, props } = renderSetting();

		expect(getLocations()).toHaveLength(props.setting.locations.length);
	});

	it('renders time of day', () => {
		const { getTimeOfDay, props } = renderSetting();

		expect(getTimeOfDay()).toHaveLength(props.setting.timeOfDays.length);
	});
});
