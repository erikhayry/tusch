<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { expectWorkflow } from '#lib/features/comics/client/workflows/asset-workflow.ts';
	import { removeCoverVariant } from '#lib/features/comics/client/workflows/remove-cover-variant.ts';
	import {
		getRemoveCoverVariantValues,
		REMOVE_COVER_VARIANT_ACTION,
	} from '#lib/features/comics/contracts/removeCoverVariant.ts';
	import { enhanceClientCommand } from '#lib/forms/enhance-client-command.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { RemoveCoverVariantFormProps } from './removeCoverVariantFormTypes';

	let { label, comicId, variant, onSuccess }: RemoveCoverVariantFormProps = $props();

	const handleSubmit = enhanceClientCommand(
		m.loadingDelete(),
		getRemoveCoverVariantValues,
		async (values) => expectWorkflow(await removeCoverVariant(workflowDeps, values)),
		async ({ update }) => {
			await update();
			onSuccess?.();
		},
	);
</script>

<form method="POST" action={`?/${REMOVE_COVER_VARIANT_ACTION}`} use:enhance={handleSubmit}>
	<input type="hidden" name="comicId" value={comicId} />
	<input type="hidden" name="variant" value={variant} />
	<button type="submit">{label}</button>
</form>
