<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { expectWorkflow } from '#lib/features/comics/client/workflows/asset-workflow.ts';
	import { undoCharacterCropFix } from '#lib/features/panels/client/workflows/undo-character-crop-fix.ts';
	import {
		getUndoCharacterCropFixValues,
		UNDO_CHARACTER_CROP_FIX_ACTION,
	} from '#lib/features/panels/contracts/undoCharacterCropFix.ts';
	import { enhanceClientCommand } from '#lib/forms/enhance-client-command.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { UndoCharacterCropFixFormProps } from './undoCharacterCropFixFormTypes';

	let { label, values, onSuccess }: UndoCharacterCropFixFormProps = $props();

	const handleSubmit = enhanceClientCommand(
		m.loadingUndoCharacterCropFix(),
		getUndoCharacterCropFixValues,
		async (value) => expectWorkflow(await undoCharacterCropFix(workflowDeps, value)),
		async ({ update }) => {
			await update();
			onSuccess?.();
		},
	);
</script>

<form method="POST" action={`?/${UNDO_CHARACTER_CROP_FIX_ACTION}`} use:enhance={handleSubmit}>
	<input type="hidden" name="comicId" value={values.comicId} />
	<input type="hidden" name="characterId" value={values.characterId} />
	<input type="hidden" name="characterImageId" value={values.characterImageId} />

	<button type="submit">{label}</button>
</form>
