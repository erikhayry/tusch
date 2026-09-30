import { renderPanel } from '$lib/components/panel/test/utils/renderPanel';
import { fireEvent } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { PanelPropsWithoutImage } from './utils/mockPanel';

describe('Panel', () => {
	it('should render title', () => {
		const { getTitle } = renderPanel();

		expect(getTitle()).toBeInTheDocument();
	});

	describe('captions', () => {
		it('render captions', () => {
			const { getCaptions, props } = renderPanel();

			expect(getCaptions()).toHaveLength(props.panel.captions.length);
		});

		it('should show edit button', () => {
			const { getEditCaptionsButton } = renderPanel();

			expect(getEditCaptionsButton(1)).toBeInTheDocument();
		});

		it('should show editable caption on edit caption click', async () => {
			const { getEditCaptionsButton, getEditCaptionField } = renderPanel();

			await fireEvent.click(getEditCaptionsButton(1));

			expect(getEditCaptionField(1)).toBeInTheDocument();
		});
	});

	describe('dialogues', () => {
		it('render dialogues', () => {
			const { getDialoguess, props } = renderPanel();

			expect(getDialoguess()).toHaveLength(props.panel.dialogue.length);
		});

		it('should show edit button', () => {
			const { getEditDialoguesButton: getEditDialoguessButton } = renderPanel();

			expect(getEditDialoguessButton(1)).toBeInTheDocument();
		});

		it('should show editable caption on edit caption click', async () => {
			const { getEditDialoguesButton: getEditDialoguessButton, getEditDialoguesField } =
				renderPanel();

			await fireEvent.click(getEditDialoguessButton(1));

			expect(getEditDialoguesField(1)).toBeInTheDocument();
		});
	});

	describe('image', () => {
		it('should show image', () => {
			const { getImage } = renderPanel();

			expect(getImage()).toBeInTheDocument();
		});

		it('should  show remove image button', () => {
			const { getRemoveImageButton } = renderPanel();

			expect(getRemoveImageButton()).toBeInTheDocument();
		});

		it('should show add image button if no image', () => {
			const { getAddImageButton } = renderPanel(PanelPropsWithoutImage[0]);

			expect(getAddImageButton()).toBeInTheDocument();
		});
	});
});
