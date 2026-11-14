/** WCAG relative luminance and contrast helpers for computed `rgb()` / `rgba()` colours. */

export function parseRgb(color: string): [number, number, number] {
	const match = color.match(/rgba?\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)/);
	if (!match) throw new Error(`Not an rgb() colour: ${color}`);
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function luminance(color: string): number {
	const [r, g, b] = parseRgb(color).map((channel) => {
		const value = channel / 255;
		return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
	const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (lighter + 0.05) / (darker + 0.05);
}
