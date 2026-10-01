import { removeImage, updatePanelCaptions } from '$lib/utils/db/db';

export const ACTION = {
	DELETE_IMAGE: 'deleteImage',
	EDIT_CAPTION: 'editCaption',
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
		const formData = await request.formData();
		const comicId = formData.get('comicId');
		const panelId = formData.get('panelId');
		const captionIndex = formData.get('captionIndex');
		const caption = formData.get('caption');

		if (comicId && panelId && caption && captionIndex) {
			updatePanelCaptions(
				comicId.toString(),
				panelId.toString(),
				Number.parseInt(captionIndex?.toString()),
				caption.toString(),
			);
		}
	},
};
