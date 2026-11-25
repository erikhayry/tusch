import type { Locator } from '@playwright/test';

export type Frame = {
	x: number;
	y: number;
	width: number;
	height: number;
	background: string;
	borderWidth: string;
	borderStyle: string;
	/** Whether the frame or an ancestor is hidden from assistive technology. */
	hidden: boolean;
	/** The frame is or holds an `<img>`. */
	hasImage: boolean;
};

/**
 * The decorative placeholder frames in `scope` (REQ-87-4, REQ-283-5): elements
 * hidden from assistive technology that are at least `minWidth` wide. They
 * are found by what they are, not by class names.
 */
export function placeholderFrames(scope: Locator, minWidth: number): Promise<Frame[]> {
	return scope.evaluate((root, min) => {
		return [...root.querySelectorAll<HTMLElement>('[aria-hidden="true"]')]
			.map((element) => {
				const { x, y, width, height } = element.getBoundingClientRect();
				const style = getComputedStyle(element);
				return {
					x,
					y,
					width,
					height,
					background: style.backgroundColor,
					borderWidth: style.borderTopWidth,
					borderStyle: style.borderTopStyle,
					hidden: true,
					hasImage: element.matches('img') || element.querySelector('img') !== null,
				};
			})
			.filter((frame) => frame.width >= min);
	}, minWidth);
}
