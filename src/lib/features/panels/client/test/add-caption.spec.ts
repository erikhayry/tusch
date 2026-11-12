import { describe, expect, it, vi } from 'vitest';
import { addCaption } from '../add-caption';

describe('addCaption client command', () => {
	it('commits the caption through the domain command', () => {
		const commands = { addCaption: vi.fn().mockReturnValue({ ok: true }) };

		addCaption({ comicId: 'c1', panelId: 'p1', caption: 'hello' }, commands);

		expect(commands.addCaption).toHaveBeenCalledWith('c1', 'p1', 'hello');
	});

	it('throws the failure message so the form surfaces it', () => {
		const commands = {
			addCaption: vi
				.fn()
				.mockReturnValue({ ok: false, code: 'panel-not-found', message: 'Panel p1 not found' }),
		};

		expect(() => addCaption({ comicId: 'c1', panelId: 'p1', caption: 'x' }, commands)).toThrow(
			'Panel p1 not found',
		);
	});
});
