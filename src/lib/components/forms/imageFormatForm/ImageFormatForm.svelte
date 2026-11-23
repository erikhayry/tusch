<script lang="ts">
	import { enhance } from '$app/forms';
	import { setImageFormat } from '#lib/features/comics/client/set-image-format.ts';
	import {
		SET_IMAGE_FORMAT_ACTION,
		getSetImageFormatValues,
	} from '#lib/features/comics/contracts/setImageFormat.ts';
	import { enhanceClientCommand } from '#lib/forms/enhance-client-command.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { ImageFormatEnum, type ImageFormat } from '#lib/types/index.ts';
	import { IMAGE_FORMAT_VALUE_KEY } from '#lib/utils/db/dbTypes.ts';
	import type { ImageFormatFormProps } from './imageFormatFormTypes';

	let { comicId, imageFormat }: ImageFormatFormProps = $props();

	const LABELS: Record<ImageFormat, () => string> = {
		both: () => m.imageFormatBoth(),
		portrait: () => m.imageFormatPortrait(),
		landscape: () => m.imageFormatLandscape(),
	};

	// No `update()`: the select already shows the saved choice, and a reset would
	// go back to the option that was selected when the page loaded.
	const handleSubmit = enhanceClientCommand(
		m.saveImageFormat(),
		getSetImageFormatValues,
		setImageFormat,
	);
</script>

<form method="POST" action={`?/${SET_IMAGE_FORMAT_ACTION}`} use:enhance={handleSubmit}>
	<input type="hidden" name="comicId" value={comicId} />
	<label>
		<span>{m.imageFormat()}</span>
		<select name={IMAGE_FORMAT_VALUE_KEY} aria-describedby="image-format-hint">
			{#each ImageFormatEnum.options as format (format)}
				<option value={format} selected={format === imageFormat}>{LABELS[format]()}</option>
			{/each}
		</select>
	</label>
	<p id="image-format-hint">{m.imageFormatHint()}</p>
	<button type="submit">{m.saveImageFormat()}</button>
</form>
