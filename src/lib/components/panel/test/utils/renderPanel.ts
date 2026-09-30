import Panel from '$lib/components/panel/Panel.svelte';
import { PanelPropsMock } from '$lib/components/panel/test/utils/mockPanel';
import { m } from '$lib/paraglide/messages';
import { render, within } from '@testing-library/svelte';

export function renderPanel(props = PanelPropsMock[0]) {
	const { getByRole } = render(Panel, props);

	return {
		getEditCaptionField: (number: number) =>
			within(getByRole('list', { name: m.captions() })).getByRole('textbox', {
				name: m.editCaption({ number }),
			}),
		getEditCaptionsButton: (number: number) =>
			within(getByRole('list', { name: m.captions() })).getByRole('button', {
				name: m.editCaption({ number }),
			}),
		getCaptions: () => within(getByRole('list', { name: m.captions() })).getAllByRole('listitem'),

		getEditDialoguesField: (number: number) =>
			within(getByRole('list', { name: m.dialogues() })).getByRole('textbox', {
				name: m.editDialogue({ number }),
			}),
		getEditDialoguesButton: (number: number) =>
			within(getByRole('list', { name: m.dialogues() })).getByRole('button', {
				name: m.editDialogue({ number }),
			}),
		getDialoguess: () =>
			within(getByRole('list', { name: m.dialogues() })).getAllByRole('listitem'),

		getAddImageButton: () => getByRole('button', { name: m.addImage() }),
		getRemoveImageButton: () => getByRole('button', { name: m.removeImage() }),
		getImage: () => getByRole('img', { name: props.panel.image?.alt }),
		getTitle: () =>
			getByRole('heading', {
				name: `${m.panelTitle({ number: props.number, total: props.totalNumberOfPanels })}`,
				level: 2,
			}),
		props,
	};
}
