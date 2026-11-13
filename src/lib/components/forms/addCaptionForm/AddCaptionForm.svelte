<script lang="ts">
	import { enhance } from '$app/forms';
	import { addCaption } from '$lib/features/panels/client/add-caption';
	import {
		ADD_CAPTION_ACTION,
		CAPTION_VALUE_KEY,
		getAddCaptionValues,
	} from '$lib/features/panels/contracts/addCaption';
	import { enhanceClientCommand } from '$lib/forms/enhance-client-command';
	import { m } from '$lib/paraglide/messages';
	import type { AddCaptionFormProps } from './addCaptionFormTypes';

	let { comicId, panelId }: AddCaptionFormProps = $props();

	// `update()` resets the native form, clearing the input after a successful add.
	const handleSubmit = enhanceClientCommand(
		m.loadingAddCaption(),
		getAddCaptionValues,
		addCaption,
		({ update }) => update(),
	);
</script>

<form method="POST" action={`?/${ADD_CAPTION_ACTION}`} use:enhance={handleSubmit}>
	<input type="hidden" name="comicId" value={comicId} />
	<input type="hidden" name="panelId" value={panelId} />
	<label>
		<span>{m.newCaption()}</span>
		<input type="text" name={CAPTION_VALUE_KEY} required />
	</label>
	<button type="submit">{m.addCaption()}</button>
</form>
