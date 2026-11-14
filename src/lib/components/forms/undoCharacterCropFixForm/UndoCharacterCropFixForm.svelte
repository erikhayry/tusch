<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { expectWorkflow } from '$lib/features/comics/client/workflows/asset-workflow';
	import { undoCharacterCropFix } from '$lib/features/panels/client/workflows/undo-character-crop-fix';
	import {
		getUndoCharacterCropFixValues,
		UNDO_CHARACTER_CROP_FIX_ACTION,
	} from '$lib/features/panels/contracts/undoCharacterCropFix';
	import { enhanceClientCommand } from '$lib/forms/enhance-client-command';
	import { m } from '$lib/paraglide/messages';
	import type { UndoCharacterCropFixFormProps } from './undoCharacterCropFixFormTypes';

	let { label, values }: UndoCharacterCropFixFormProps = $props();

	const handleSubmit = enhanceClientCommand(
		m.loadingUndoCharacterCropFix(),
		getUndoCharacterCropFixValues,
		async (value) => expectWorkflow(await undoCharacterCropFix(workflowDeps, value)),
		async ({ update }) => {
			await update();
		},
	);
</script>

<form method="POST" action={`?/${UNDO_CHARACTER_CROP_FIX_ACTION}`} use:enhance={handleSubmit}>
	<input type="hidden" name="comicId" value={values.comicId} />
	<input type="hidden" name="characterId" value={values.characterId} />
	<input type="hidden" name="characterImageId" value={values.characterImageId} />

	<button type="submit">{label}</button>
</form>
