import { describe, expect, it } from 'vitest';
import { renderCreateComicForm } from './utils/renderCreateComicForm';

describe('CreateComicForm', () => {
	it('should render name', () => {
		const { getButton } = renderCreateComicForm();

		expect(getButton()).toBeInTheDocument();
	});

	it('should render comic styles', () => {
		const { getComicStylesSelect } = renderCreateComicForm();

		expect(getComicStylesSelect()).toBeInTheDocument();
	});
});
