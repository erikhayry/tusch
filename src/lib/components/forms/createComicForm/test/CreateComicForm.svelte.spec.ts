import { describe, expect, it } from 'vitest';
import { renderCreateComicForm } from './utils/renderCreateComicForm';

describe('CreateComicForm', () => {
	it('should render name', () => {
		const { getButton } = renderCreateComicForm();

		expect(getButton()).toBeInTheDocument();
	});
});
