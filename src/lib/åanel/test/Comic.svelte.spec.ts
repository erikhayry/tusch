import { render } from '@testing-library/svelte';
import Comic from '$lib/comic/Comic.svelte';
import { describe, expect, it } from 'vitest';

describe('Comic', () => {
	it('should render title', () => {
		const { getByRole } = render(Comic, { title: 'test title' });

		expect(getByRole('heading', { name: 'test title' })).toBeInTheDocument();
	});
});
