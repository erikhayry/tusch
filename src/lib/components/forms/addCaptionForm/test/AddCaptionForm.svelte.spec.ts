import { m } from '$lib/paraglide/messages';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AddCaptionForm from '../AddCaptionForm.svelte';

const props = { comicId: 'comic-1', panelId: 'panel-1' };

describe('AddCaptionForm', () => {
	it('renders a native form posting to the client action', () => {
		const { container } = render(AddCaptionForm, props);

		expect(container.querySelector('form')).toHaveAttribute('method', 'POST');
		expect(container.querySelector('form')).toHaveAttribute('action', '?/client');
	});

	it('renders a required caption input and submit button', () => {
		const { getByRole } = render(AddCaptionForm, props);

		expect(getByRole('textbox', { name: m.newCaption() })).toBeRequired();
		expect(getByRole('button', { name: m.addCaption() })).toBeInTheDocument();
	});

	it('submits the comic and panel ids as hidden fields', () => {
		const { container } = render(AddCaptionForm, props);

		expect(container.querySelector('input[name="comicId"]')).toHaveValue('comic-1');
		expect(container.querySelector('input[name="panelId"]')).toHaveValue('panel-1');
	});
});
