import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Welcome from './Welcome.svelte';

describe('Welcome.svelte', () => {
	it('renders greetings for host and guest', async () => {
		render(Welcome, { host: 'SvelteKit', guest: 'Vitest' });

		expect(screen.getByRole('heading', { name: 'Hello, SvelteKit!' })).toBeInTheDocument();
	});
});
