import { removeImage, updatePanelCaptions, updatePanelDialogue } from '$lib/utils/db/db';

export const ACTION = {
	DELETE_IMAGE: 'deleteImage',
	EDIT_CAPTION: 'editCaption',
	EDIT_DIALOGUE: 'editDialogue',
} as const;

export const panelActions = {
	[ACTION.DELETE_IMAGE]: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const comicId = formData.get('comicId');
		const panelId = formData.get('panelId');

		if (comicId && panelId) {
			removeImage(comicId.toString(), panelId.toString());
		}
	},
	[ACTION.EDIT_CAPTION]: async ({ request }: { request: Request }) => {
		console.log('edit');
		const formData = await request.formData();
		const comicId = formData.get('comicId');
		const panelId = formData.get('panelId');
		const captionIndex = formData.get('captionIndex');
		const caption = formData.get('caption');
		console.log(comicId, panelId, captionIndex, caption);

		if (comicId && panelId && caption && captionIndex) {
			updatePanelCaptions(
				comicId.toString(),
				panelId.toString(),
				Number.parseInt(captionIndex?.toString()),
				caption.toString(),
			);
		}
	},
	[ACTION.EDIT_DIALOGUE]: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const comicId = formData.get('comicId');
		const panelId = formData.get('panelId');
		const dialogueIndex = formData.get('dialogueIndex');
		const dialogue = formData.get('dialogue');

		if (comicId && panelId && dialogue && dialogueIndex) {
			updatePanelDialogue(
				comicId.toString(),
				panelId.toString(),
				Number.parseInt(dialogueIndex?.toString()),
				dialogue.toString(),
			);
		}
	},
};
