import { renderPanel } from '$lib/components/panel/test/utils/renderPanel';
import { fireEvent } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { PanelPropsWithoutImage } from './utils/mockPanel';

describe('Panel', () => {
	it('should render title', () => {
		const { getTitle } = renderPanel();

		expect(getTitle()).toBeInTheDocument();
	});

	it('should render visual description', () => {
		const { getVisualDescription } = renderPanel();

		expect(getVisualDescription()).toBeInTheDocument();
	});

	it('should show time of day', () => {
		const { getTimeOfDay } = renderPanel();

		expect(getTimeOfDay()).toBeInTheDocument();
	});

	it('should show season', () => {
		const { getSeason } = renderPanel();

		expect(getSeason()).toBeInTheDocument();
	});

	it('should show year', () => {
		const { getYear } = renderPanel();

		expect(getYear()).toBeInTheDocument();
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

		it('should show save caption button on edit caption click', async () => {
			const { getSaveCaptionButton, getEditCaptionsButton } = renderPanel();

			await fireEvent.click(getEditCaptionsButton(1));

			expect(getSaveCaptionButton(1)).toBeInTheDocument();
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
			const { getImage, props } = renderPanel();

			expect(getImage()).toHaveAttribute('src', props.panel.image?.wide?.src);
		});

		it('should show remove image button', () => {
			const { getRemoveImageButton } = renderPanel();

			expect(getRemoveImageButton()).toBeInTheDocument();
		});

		it('should show generate new image button', () => {
			const { getGenerateNewImageButton } = renderPanel();

			expect(getGenerateNewImageButton()).toBeInTheDocument();
		});

		it('should show add image button if no image', () => {
			const { getAddImageButton } = renderPanel(PanelPropsWithoutImage[0]);

			expect(getAddImageButton()).toBeInTheDocument();
		});
	});
});
